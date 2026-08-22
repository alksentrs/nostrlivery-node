#!/bin/bash

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "Error: Docker is not installed or not in PATH."
    echo ""
    echo "To install Docker on Ubuntu/Debian, run:"
    echo "  sudo apt update"
    echo "  sudo apt install -y docker.io"
    echo "  sudo systemctl start docker"
    echo "  sudo systemctl enable docker"
    echo "  sudo usermod -aG docker $USER"
    echo ""
    echo "After adding your user to the docker group, you may need to log out and back in."
    exit 1
fi

# Check if Docker daemon is running
if ! docker info &> /dev/null; then
    echo "Error: Docker daemon is not running."
    echo ""
    echo "To start Docker, run:"
    echo "  sudo systemctl start docker"
    echo ""
    echo "Or if you need to install Docker, see the instructions above."
    exit 1
fi

# Ensure required directories exist
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DATA_DIR="$SCRIPT_DIR/data"
CONFIG_FILE="$SCRIPT_DIR/config.toml"

# Create data directory if it doesn't exist
if [ ! -d "$DATA_DIR" ]; then
    echo "Creating data directory: $DATA_DIR"
    mkdir -p "$DATA_DIR"
fi

# Check if config.toml exists
if [ ! -f "$CONFIG_FILE" ]; then
    echo "Warning: config.toml not found at $CONFIG_FILE"
    echo "The relay may not start correctly without a configuration file."
fi

# Run the Docker container
echo "Starting Nostr relay on port 7000..."
docker run -it -p 7000:7000 \
  --mount src="$CONFIG_FILE",target=/usr/src/app/config.toml,type=bind \
  --mount src="$DATA_DIR",target=/usr/src/app/db,type=bind \
  scsibug/nostr-rs-relay