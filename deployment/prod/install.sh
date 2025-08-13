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

echo "--> Stopping frontend services..."
systemctl --user stop "${SERVICE_NAME}" || true

echo "--> Setting up SSL certificates..."
# Run certbot to create certificates if they don't exist
chmod +x "${STAGING_DIR}/certbot.sh"
"${STAGING_DIR}/certbot.sh"

echo "--> Setting up systemd user service..."
mkdir -p "${SERVICE_DIR}"
cp "${STAGING_DIR}/${SERVICE_NAME}.service" "${SERVICE_DIR}/"
systemctl --user daemon-reload
systemctl --user enable "${SERVICE_NAME}.service"

echo "--> Starting frontend services..."
systemctl --user start "${SERVICE_NAME}"

echo "--- Frontend deployment finished ---"