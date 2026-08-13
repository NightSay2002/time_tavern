param(
  [Parameter(Mandatory = $true)]
  [string]$ProjectRoot
)

$ErrorActionPreference = "Stop"
$MinimumNodeMajor = 18
$NodeReleaseMajor = if ($env:TIME_TAVERN_NODE_RELEASE_MAJOR) {
  $env:TIME_TAVERN_NODE_RELEASE_MAJOR
} else {
  "24"
}
$RuntimeRoot = Join-Path $ProjectRoot ".runtime"
$NodeHome = Join-Path $RuntimeRoot "node"
$NodeBinary = Join-Path $NodeHome "node.exe"

function Get-NodeMajor([string]$Executable) {
  if (-not (Test-Path -LiteralPath $Executable -PathType Leaf)) {
    return 0
  }
  try {
    return [int](& $Executable -p 'Number(process.versions.node.split(".")[0])')
  } catch {
    return 0
  }
}

function Invoke-Download([string]$Uri, [string]$OutputFile) {
  for ($Attempt = 1; $Attempt -le 3; $Attempt++) {
    try {
      Invoke-WebRequest -UseBasicParsing -Uri $Uri -OutFile $OutputFile
      return
    } catch {
      if ($Attempt -eq 3) {
        throw
      }
      Start-Sleep -Seconds 2
    }
  }
}

if ((Get-NodeMajor $NodeBinary) -ge $MinimumNodeMajor) {
  exit 0
}

$Architecture = if ($env:TIME_TAVERN_NODE_ARCH) {
  $env:TIME_TAVERN_NODE_ARCH.ToLowerInvariant()
} elseif ($env:PROCESSOR_ARCHITEW6432) {
  $env:PROCESSOR_ARCHITEW6432.ToLowerInvariant()
} else {
  $env:PROCESSOR_ARCHITECTURE.ToLowerInvariant()
}
$NodeArchitecture = switch ($Architecture) {
  { $_ -in @("arm64", "aarch64") } { "arm64"; break }
  { $_ -in @("amd64", "x86_64") } { "x64"; break }
  default { throw "Unsupported Windows architecture: $Architecture" }
}

$DistBase = if ($env:TIME_TAVERN_NODE_DIST_BASE) {
  $env:TIME_TAVERN_NODE_DIST_BASE.TrimEnd([char[]]"/")
} else {
  "https://nodejs.org/download/release/latest-v$NodeReleaseMajor.x"
}

[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
New-Item -ItemType Directory -Force -Path $RuntimeRoot | Out-Null
$WorkDirectory = Join-Path $RuntimeRoot ("node-install-" + [Guid]::NewGuid().ToString("N"))
New-Item -ItemType Directory -Force -Path $WorkDirectory | Out-Null

try {
  $ShasumsFile = Join-Path $WorkDirectory "SHASUMS256.txt"
  Write-Host "Downloading project Node.js $NodeReleaseMajor.x LTS metadata..."
  Invoke-Download "$DistBase/SHASUMS256.txt" $ShasumsFile

  $ArchiveSuffix = "-win-$NodeArchitecture.zip"
  $ChecksumLine = Get-Content -LiteralPath $ShasumsFile |
    Where-Object { $_.Trim().EndsWith($ArchiveSuffix, [StringComparison]::OrdinalIgnoreCase) } |
    Select-Object -First 1
  if (-not $ChecksumLine -or $ChecksumLine -notmatch '^([a-fA-F0-9]{64})\s+(.+)$') {
    throw "The Node.js archive for Windows $NodeArchitecture was not found."
  }

  $ExpectedHash = $Matches[1].ToLowerInvariant()
  $ArchiveName = $Matches[2].Trim()
  $ArchiveFile = Join-Path $WorkDirectory $ArchiveName
  Write-Host "Downloading $ArchiveName..."
  Invoke-Download "$DistBase/$ArchiveName" $ArchiveFile

  $ActualHash = (Get-FileHash -Algorithm SHA256 -LiteralPath $ArchiveFile).Hash.ToLowerInvariant()
  if ($ActualHash -ne $ExpectedHash) {
    throw "Node.js SHA-256 verification failed."
  }

  $ExtractDirectory = Join-Path $WorkDirectory "extracted"
  Expand-Archive -LiteralPath $ArchiveFile -DestinationPath $ExtractDirectory
  $ExtractedNodeHome = Get-ChildItem -LiteralPath $ExtractDirectory -Directory | Select-Object -First 1
  if (-not $ExtractedNodeHome) {
    throw "The downloaded Node.js archive is incomplete."
  }

  $ExtractedNodeBinary = Join-Path $ExtractedNodeHome.FullName "node.exe"
  $ExtractedNpmCommand = Join-Path $ExtractedNodeHome.FullName "npm.cmd"
  if ((Get-NodeMajor $ExtractedNodeBinary) -lt $MinimumNodeMajor) {
    throw "The downloaded Node.js version does not satisfy Node.js >= $MinimumNodeMajor."
  }
  if (-not (Test-Path -LiteralPath $ExtractedNpmCommand -PathType Leaf)) {
    throw "The downloaded Node.js archive does not include npm."
  }

  $PreviousNodeHome = Join-Path $RuntimeRoot "node.previous"
  Remove-Item -LiteralPath $PreviousNodeHome -Recurse -Force -ErrorAction SilentlyContinue
  if (Test-Path -LiteralPath $NodeHome) {
    Move-Item -LiteralPath $NodeHome -Destination $PreviousNodeHome
  }
  try {
    Move-Item -LiteralPath $ExtractedNodeHome.FullName -Destination $NodeHome
  } catch {
    if (Test-Path -LiteralPath $PreviousNodeHome) {
      Move-Item -LiteralPath $PreviousNodeHome -Destination $NodeHome
    }
    throw
  }
  Remove-Item -LiteralPath $PreviousNodeHome -Recurse -Force -ErrorAction SilentlyContinue
  Write-Host "Installed project Node.js $(& $NodeBinary --version)."
} finally {
  Remove-Item -LiteralPath $WorkDirectory -Recurse -Force -ErrorAction SilentlyContinue
}
