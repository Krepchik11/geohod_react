#!/bin/bash
set -euo pipefail

# Parse command line arguments
FORCE_RENEWAL=false
while [[ $# -gt 0 ]]; do
    case $1 in
        -f|--force)
            FORCE_RENEWAL=true
            shift
            ;;
        -h|--help)
            echo "Usage: $0 [OPTIONS]"
            echo "Options:"
            echo "  -f, --force    Force renewal of certificates even if not expired"
            echo "  -h, --help     Show this help message"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            echo "Use -h or --help for usage information"
            exit 1
            ;;
    esac
done

EMAIL="idemozajedno@yandex.ru"
DOMAINS=("dev.geohod.ru" "app.geohod.ru")
CERTS_VOLUMES=("certbot_certs_dev" "certbot_certs")
MOUNT_PATHS=("/etc/letsencrypt")
CERTBOT_IMAGE="docker.io/certbot/certbot:latest"

# Function to check certificate expiration
check_certificate_expiration() {
    local domain=$1
    local certs_volume=$2
    local mount_path=$3
    
    # Check if certificates exist
    if ! podman volume inspect "$certs_volume" >/dev/null 2>&1; then
        return 1 # Volume doesn't exist
    fi
    
    if ! podman run --rm -v "$certs_volume:$mount_path" \
        --entrypoint /bin/sh \
        "$CERTBOT_IMAGE" \
        -c "test -d $mount_path/live/$domain" >/dev/null 2>&1; then
        return 1 # Certificate directory doesn't exist
    fi
    
    # Check certificate expiration using openssl
    local cert_file="$mount_path/live/$domain/cert.pem"
    local expiry_date
    
    expiry_date=$(podman run --rm -v "$certs_volume:$mount_path" \
        --entrypoint /bin/sh \
        "$CERTBOT_IMAGE" \
        -c "openssl x509 -enddate -noout -in $cert_file" | cut -d= -f2)
    
    # Convert expiry date to timestamp
    local expiry_timestamp
    expiry_timestamp=$(date -d "$expiry_date" +%s 2>/dev/null || echo "0")
    local current_timestamp
    current_timestamp=$(date +%s)
    
    # Check if certificate expires within 30 days (2592000 seconds)
    local threshold_timestamp=$((current_timestamp + 2592000))
    
    if [ "$expiry_timestamp" -lt "$threshold_timestamp" ]; then
        echo "Certificate for $domain expires on $expiry_date (within 30 days)"
        return 0 # Certificate is expired or near expiry
    else
        echo "Certificate for $domain is valid until $expiry_date"
        return 1 # Certificate is still valid
    fi
}

# Function to create or renew certificates
process_certificate() {
    local domain=$1
    local certs_volume=$2
    local mount_path=$3
    
    # Create the volume if it doesn't exist
    if ! podman volume inspect "$certs_volume" >/dev/null 2>&1; then
        echo "Creating volume $certs_volume..."
        podman volume create "$certs_volume"
    fi
    
    echo "Processing certificates for $domain..."
    
    # Determine if we need to force renewal
    local renew_args=""
    if [ "$FORCE_RENEWAL" = true ]; then
        renew_args="--force-renewal"
        echo "Force renewal requested for $domain"
    fi
    
    podman run --rm \
        --network host \
        -v "$certs_volume:$mount_path" \
        "$CERTBOT_IMAGE" \
        certonly --standalone \
        --email "$EMAIL" \
        --agree-tos \
        --no-eff-email \
        --non-interactive \
        $renew_args \
        -d "$domain"
    
    if [ $? -eq 0 ]; then
        echo "Certificates processed successfully for $domain!"
    else
        echo "Failed to process certificates for $domain!"
        exit 1
    fi
}

# Main processing loop
for i in "${!DOMAINS[@]}"; do
    DOMAIN="${DOMAINS[$i]}"
    CERTS_VOLUME="${CERTS_VOLUMES[$i]}"
    MOUNT_PATH="${MOUNT_PATHS}"
    
    echo "=== Processing domain: $DOMAIN ==="
    
    # Check if certificates exist
    if podman volume inspect "$CERTS_VOLUME" >/dev/null 2>&1; then
        if podman run --rm -v "$CERTS_VOLUME:$MOUNT_PATH" \
            --entrypoint /bin/sh \
            "$CERTBOT_IMAGE" \
            -c "test -d $MOUNT_PATH/live/$DOMAIN" >/dev/null 2>&1; then
            
            # Certificates exist, check if they need renewal
            if [ "$FORCE_RENEWAL" = true ]; then
                echo "Force renewal requested, processing certificates for $DOMAIN..."
                process_certificate "$DOMAIN" "$CERTS_VOLUME" "$MOUNT_PATH"
            else
                if check_certificate_expiration "$DOMAIN" "$CERTS_VOLUME" "$MOUNT_PATH"; then
                    echo "Certificate needs renewal or is expired, processing certificates for $DOMAIN..."
                    process_certificate "$DOMAIN" "$CERTS_VOLUME" "$MOUNT_PATH"
                else
                    echo "Certificates already exist and are valid for $DOMAIN, skipping..."
                fi
            fi
        else
            # No certificates found, create them
            echo "No certificates found for $DOMAIN, creating new certificates..."
            process_certificate "$DOMAIN" "$CERTS_VOLUME" "$MOUNT_PATH"
        fi
    else
        # Volume doesn't exist, create it and certificates
        echo "No volume found for $DOMAIN, creating new certificates..."
        process_certificate "$DOMAIN" "$CERTS_VOLUME" "$MOUNT_PATH"
    fi
    
    echo ""
done

echo "All certificates processed successfully!"