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

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js was not found. Please install Node.js first:
  echo https://nodejs.org/
  pause
  exit /b 1
)

where npm >nul 2>nul
if errorlevel 1 (
  echo npm was not found. Please install Node.js with npm first.
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

echo.
echo Server stopped.
pause
