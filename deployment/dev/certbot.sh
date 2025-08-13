#!/bin/bash
set -euo pipefail

EMAIL="idemozajedno@yandex.ru"
DOMAIN="dev.geohod.ru"
CERTS_VOLUME="certbot_certs_dev"
CERTBOT_IMAGE="docker.io/certbot/certbot:latest"

# Check if certificates already exist by checking the directory directly
if podman volume inspect "$CERTS_VOLUME" >/dev/null 2>&1; then
    if podman run --rm -v "$CERTS_VOLUME:/etc/letsencrypt" \
        --entrypoint /bin/sh \
        "$CERTBOT_IMAGE" \
        -c "test -d /etc/letsencrypt/live/$DOMAIN" >/dev/null 2>&1; then
        echo "Certificates already exist for $DOMAIN"
        exit 0
    fi
fi

echo "Creating certificates for $DOMAIN..."

# Create the volume if it doesn't exist
if ! podman volume inspect "$CERTS_VOLUME" >/dev/null 2>&1; then
    echo "Creating volume $CERTS_VOLUME..."
    podman volume create "$CERTS_VOLUME"
fi

podman run --rm \
    --network host \
    -v "$CERTS_VOLUME:/etc/letsencrypt" \
    "$CERTBOT_IMAGE" \
    certonly --standalone \
    --email "$EMAIL" \
    --agree-tos \
    --no-eff-email \
    --non-interactive \
    -d "$DOMAIN"

if [ $? -eq 0 ]; then
    echo "Certificates created successfully!"
else
    echo "Failed to create certificates!"
    exit 1
fi