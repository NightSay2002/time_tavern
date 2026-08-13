#!/bin/zsh

set -eu

PROJECT_ROOT="${1:-$(cd "$(dirname "$0")/.." && pwd)}"
MINIMUM_NODE_MAJOR=18
NODE_RELEASE_MAJOR="${TIME_TAVERN_NODE_RELEASE_MAJOR:-24}"
RUNTIME_ROOT="$PROJECT_ROOT/.runtime"
NODE_HOME="$RUNTIME_ROOT/node"
NODE_BINARY="$NODE_HOME/bin/node"

node_major() {
  "$1" -p 'Number(process.versions.node.split(".")[0])' 2>/dev/null || printf '0\n'
}

if [ -x "$NODE_BINARY" ]; then
  INSTALLED_MAJOR=$(node_major "$NODE_BINARY")
  if [[ "$INSTALLED_MAJOR" == <-> ]] && (( INSTALLED_MAJOR >= MINIMUM_NODE_MAJOR )); then
    exit 0
  fi
fi

for REQUIRED_COMMAND in curl tar shasum mktemp; do
  if ! command -v "$REQUIRED_COMMAND" >/dev/null 2>&1; then
    echo "Missing required macOS command: $REQUIRED_COMMAND" >&2
    exit 1
  fi
done

case "${TIME_TAVERN_NODE_ARCH:-$(uname -m)}" in
  arm64|aarch64)
    NODE_ARCH="arm64"
    ;;
  x86_64|amd64)
    NODE_ARCH="x64"
    ;;
  *)
    echo "Unsupported macOS architecture: $(uname -m)" >&2
    exit 1
    ;;
esac

DIST_BASE="${TIME_TAVERN_NODE_DIST_BASE:-https://nodejs.org/download/release/latest-v${NODE_RELEASE_MAJOR}.x}"
mkdir -p "$RUNTIME_ROOT"
WORK_DIR=$(mktemp -d "$RUNTIME_ROOT/node-install.XXXXXX")
trap 'rm -rf "$WORK_DIR"' EXIT

SHASUMS_FILE="$WORK_DIR/SHASUMS256.txt"
echo "Downloading project Node.js ${NODE_RELEASE_MAJOR}.x LTS metadata..."
curl --fail --location --silent --show-error --retry 3 --connect-timeout 15 \
  "$DIST_BASE/SHASUMS256.txt" --output "$SHASUMS_FILE"

ARCHIVE_SUFFIX="-darwin-${NODE_ARCH}.tar.gz"
ARCHIVE_NAME=$(awk -v suffix="$ARCHIVE_SUFFIX" \
  'length($2) >= length(suffix) && substr($2, length($2) - length(suffix) + 1) == suffix { print $2; exit }' \
  "$SHASUMS_FILE")
if [ -z "$ARCHIVE_NAME" ]; then
  echo "The Node.js archive for macOS ${NODE_ARCH} was not found." >&2
  exit 1
fi

EXPECTED_HASH=$(awk -v archive="$ARCHIVE_NAME" '$2 == archive { print tolower($1); exit }' "$SHASUMS_FILE")
ARCHIVE_FILE="$WORK_DIR/$ARCHIVE_NAME"
echo "Downloading $ARCHIVE_NAME..."
curl --fail --location --silent --show-error --retry 3 --connect-timeout 15 \
  "$DIST_BASE/$ARCHIVE_NAME" --output "$ARCHIVE_FILE"

ACTUAL_HASH=$(shasum -a 256 "$ARCHIVE_FILE" | awk '{ print tolower($1) }')
if [ -z "$EXPECTED_HASH" ] || [ "$ACTUAL_HASH" != "$EXPECTED_HASH" ]; then
  echo "Node.js SHA-256 verification failed." >&2
  exit 1
fi

EXTRACT_DIR="$WORK_DIR/extracted"
mkdir -p "$EXTRACT_DIR"
tar -xzf "$ARCHIVE_FILE" -C "$EXTRACT_DIR"
EXTRACTED_NODE_DIR=$(find "$EXTRACT_DIR" -mindepth 1 -maxdepth 1 -type d -print | head -n 1)
if [ -z "$EXTRACTED_NODE_DIR" ] ||
  [ ! -x "$EXTRACTED_NODE_DIR/bin/node" ] ||
  [ ! -x "$EXTRACTED_NODE_DIR/bin/npm" ]; then
  echo "The downloaded Node.js archive is incomplete." >&2
  exit 1
fi

DOWNLOADED_MAJOR=$(node_major "$EXTRACTED_NODE_DIR/bin/node")
if [[ "$DOWNLOADED_MAJOR" != <-> ]] || (( DOWNLOADED_MAJOR < MINIMUM_NODE_MAJOR )); then
  echo "The downloaded Node.js version does not satisfy Node.js >= ${MINIMUM_NODE_MAJOR}." >&2
  exit 1
fi

PREVIOUS_NODE_HOME="$RUNTIME_ROOT/node.previous"
rm -rf "$PREVIOUS_NODE_HOME"
if [ -e "$NODE_HOME" ]; then
  mv "$NODE_HOME" "$PREVIOUS_NODE_HOME"
fi
if ! mv "$EXTRACTED_NODE_DIR" "$NODE_HOME"; then
  [ ! -e "$PREVIOUS_NODE_HOME" ] || mv "$PREVIOUS_NODE_HOME" "$NODE_HOME"
  echo "Failed to install the project Node.js runtime." >&2
  exit 1
fi
rm -rf "$PREVIOUS_NODE_HOME"

echo "Installed project Node.js $($NODE_BINARY --version)."
