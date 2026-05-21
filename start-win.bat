@echo off
setlocal

cd /d "%~dp0"

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

start "" "http://localhost:%PORT_VALUE%"
call npm start

echo.
echo Server stopped.
pause
