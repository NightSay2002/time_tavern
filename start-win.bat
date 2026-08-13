@echo off
setlocal

cd /d "%~dp0"

if not exist ".env" if exist "data\environment.env" (
  copy /Y "data\environment.env" ".env" >nul
  if errorlevel 1 (
    echo Failed to restore .env from data/environment.env.
    pause
    exit /b 1
  )
  echo [Settings] Restored .env from data/environment.env.
)

set "PORT_VALUE=3234"
if exist ".env" (
  for /f "usebackq tokens=1,* delims==" %%A in (".env") do (
    if /I "%%A"=="PORT" set "PORT_VALUE=%%~B"
  )
)
set PORT_VALUE=%PORT_VALUE:"=%
set PORT_VALUE=%PORT_VALUE:'=%

call :has_usable_node
if errorlevel 1 (
  echo Node.js 18 or newer was not found. Installing a project Node.js runtime...
  powershell -NoProfile -ExecutionPolicy Bypass -File "scripts\bootstrap-node-win.ps1" -ProjectRoot "%CD%"
  if errorlevel 1 (
    echo Project Node.js installation failed.
    pause
    exit /b 1
  )
  set "PATH=%CD%\.runtime\node;%PATH%"
)

call :has_usable_node
if errorlevel 1 (
  echo Node.js 18 or newer and npm are required.
  pause
  exit /b 1
)

if not exist "node_modules\discord.js" (
  echo Installing dependencies...
  call npm install
  if errorlevel 1 (
    echo npm install failed.
    pause
    exit /b 1
  )
)

start "" powershell -NoProfile -WindowStyle Hidden -Command "$url='http://localhost:%PORT_VALUE%'; for($i=0; $i -lt 90; $i++){ try { Invoke-WebRequest -UseBasicParsing -Uri $url -TimeoutSec 1 | Out-Null; Start-Process $url; exit } catch {}; Start-Sleep -Seconds 1 }; Start-Process $url"
call npm start
set "EXIT_CODE=%ERRORLEVEL%"

echo.
echo Server stopped.
pause
exit /b %EXIT_CODE%

:has_usable_node
set "NODE_MAJOR=0"
where node >nul 2>nul
if errorlevel 1 exit /b 1
for /f "delims=" %%V in ('node -p "Number(process.versions.node.split('.')[0])" 2^>nul') do set "NODE_MAJOR=%%V"
if %NODE_MAJOR% LSS 18 exit /b 1
where npm >nul 2>nul
if errorlevel 1 exit /b 1
exit /b 0
