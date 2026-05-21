#!/bin/zsh

cd "$(dirname "$0")" || exit 1

PORT_VALUE="3234"
if [ -f ".env" ]; then
  ENV_PORT=$(grep -E "^PORT=" ".env" | tail -n 1 | cut -d "=" -f 2- | tr -d "\"'")
  if [ -n "$ENV_PORT" ]; then
    PORT_VALUE="$ENV_PORT"
  fi
fi

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js was not found. Please install Node.js first:"
  echo "https://nodejs.org/"
  read "REPLY?Press Enter to close..."
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "npm was not found. Please install Node.js with npm first."
  read "REPLY?Press Enter to close..."
  exit 1
fi

if [ ! -d "node_modules" ] || [ ! -d "node_modules/discord.js" ]; then
  echo "Installing dependencies..."
  npm install || {
    echo "npm install failed."
    read "REPLY?Press Enter to close..."
    exit 1
  }
fi

(sleep 2; open "http://localhost:${PORT_VALUE}") >/dev/null 2>&1 &

npm start
EXIT_CODE=$?

echo
echo "Server stopped."
read "REPLY?Press Enter to close..."
exit "$EXIT_CODE"
