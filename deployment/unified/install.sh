#!/bin/bash
set -euo pipefail

STAGING_DIR="${HOME}/frontend-app-unified"
SERVICE_NAME="frontend-app-unified"
SERVICE_DIR="${HOME}/.config/systemd/user"
NETWORK_NAMES=("geohod-net-dev" "geohod-net")

echo "--- Starting Frontend Unified Deployment ---"

# Create both networks if they don't exist
for NETWORK_NAME in "${NETWORK_NAMES[@]}"; do
    echo "--> Checking for and creating Podman network '${NETWORK_NAME}'..."
    if ! podman network exists "${NETWORK_NAME}"; then
        podman network create "${NETWORK_NAME}"
        echo "    Network '${NETWORK_NAME}' created successfully."
    else
        echo "    Network '${NETWORK_NAME}' already exists. Skipping creation."
    fi
done

echo "--> Stopping frontend services..."
systemctl --user stop "${SERVICE_NAME}" || true

# Wait a moment for services to stop
sleep 5

echo "--> Cleaning up existing containers..."
podman-compose -f "${STAGING_DIR}/podman-compose.yml" down || true

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

echo "--- Frontend unified deployment finished ---"