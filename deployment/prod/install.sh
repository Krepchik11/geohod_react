#!/bin/bash
set -euo pipefail

STAGING_DIR="${HOME}/frontend-app"
SERVICE_NAME="frontend-app"
SERVICE_DIR="${HOME}/.config/systemd/user"
NETWORK_NAME="geohod-net"

echo "--- Starting Frontend Deployment ---"

echo "--> Checking for and creating Podman network '${NETWORK_NAME}'..."
if ! podman network exists "${NETWORK_NAME}"; then
  podman network create "${NETWORK_NAME}"
  echo "    Network '${NETWORK_NAME}' created successfully."
else
  echo "    Network '${NETWORK_NAME}' already exists. Skipping creation."
fi
# ---

echo "--> Setting up systemd user service..."
mkdir -p "${SERVICE_DIR}"
cp "${STAGING_DIR}/${SERVICE_NAME}.service" "${SERVICE_DIR}/"
systemctl --user enable "${SERVICE_NAME}.service"

echo "--> Reloading systemd user daemon and restarting service..."
systemctl --user daemon-reload
systemctl --user restart "${SERVICE_NAME}"

echo "--- Frontend deployment finished ---"