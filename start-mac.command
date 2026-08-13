#!/bin/zsh

cd "$(dirname "$0")" || exit 1

if [ ! -f ".env" ] && [ -f "data/environment.env" ]; then
  if ! cp "data/environment.env" ".env"; then
    echo "Failed to restore .env from data/environment.env."
    read "REPLY?Press Enter to close..."
    exit 1
  fi
  chmod 600 ".env" 2>/dev/null || true
  echo "[Settings] Restored .env from data/environment.env."
fi

PORT_VALUE="3234"
if [ -f ".env" ]; then
  ENV_PORT=$(grep -E "^PORT=" ".env" | tail -n 1 | cut -d "=" -f 2- | tr -d "\"'")
  if [ -n "$ENV_PORT" ]; then
    PORT_VALUE="$ENV_PORT"
  fi
fi

node_is_usable() {
  command -v node >/dev/null 2>&1 || return 1
  command -v npm >/dev/null 2>&1 || return 1
  local node_major
  node_major=$(node -p 'Number(process.versions.node.split(".")[0])' 2>/dev/null || printf '0\n')
  [[ "$node_major" == <-> ]] && (( node_major >= 18 ))
}

if ! node_is_usable; then
  echo "Node.js 18 or newer was not found. Installing a project Node.js runtime..."
  zsh "scripts/bootstrap-node-mac.sh" "$(pwd)" || {
    echo "Project Node.js installation failed."
    read "REPLY?Press Enter to close..."
    exit 1
  }
  export PATH="$(pwd)/.runtime/node/bin:$PATH"
fi

if ! node_is_usable; then
  echo "Node.js 18 or newer and npm are required."
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

(
  for _ in {1..90}; do
    if curl -fsS "http://localhost:${PORT_VALUE}" >/dev/null 2>&1; then
      open "http://localhost:${PORT_VALUE}"
      exit 0
    fi
    sleep 1
  done
  open "http://localhost:${PORT_VALUE}"
) >/dev/null 2>&1 &

npm start
EXIT_CODE=$?

echo
echo "Server stopped."
read "REPLY?Press Enter to close..."
exit "$EXIT_CODE"
