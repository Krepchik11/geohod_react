#!/bin/bash

# Скрипт для обновления nginx конфигурации на сервере
# Использование: ./update-nginx-config.sh [domain]

set -e

if [ $# -eq 0 ]; then
    echo "Использование: $0 <domain>"
    echo "Пример: $0 app.geohod.ru"
    exit 1
fi

DOMAIN=$1
echo "Обновление nginx конфигурации для домена: $DOMAIN"

# Создаем обновленную конфигурацию
cat > nginx-https-updated.conf << EOF
# HTTPS server configuration for production
server {
    listen 443 ssl http2;
    server_name $DOMAIN;
    root /usr/share/nginx/html;
    index index.html;

    # SSL configuration
    ssl_certificate /etc/nginx/ssl/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security headers for Telegram Web App
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' https: data: blob: 'unsafe-inline'; frame-ancestors 'self' https://web.telegram.org;" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Static files caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # API proxy to backend
    location /api/ {
        proxy_pass https://app.geohod.ru;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header X-Forwarded-Host \$host;
        proxy_set_header X-Forwarded-Port \$server_port;
        
        # Timeouts
        proxy_connect_timeout 30s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
        
        # Buffering
        proxy_buffering on;
        proxy_buffer_size 4k;
        proxy_buffers 8 4k;
    }

    # React Router handling
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # Error handling
    error_page 404 /index.html;
    error_page 500 502 503 504 /50x.html;
    location = /50x.html {
        root /usr/share/nginx/html;
    }
}

# HTTP to HTTPS redirect
server {
    listen 80;
    server_name $DOMAIN;
    return 301 https://\$server_name\$request_uri;
}
EOF

echo "Конфигурация обновлена для домена: $DOMAIN"
echo "Файл: nginx-https-updated.conf"
echo ""
echo "Следующие шаги:"
echo "1. Скопируйте файл на сервер"
echo "2. Обновите Dockerfile для использования новой конфигурации"
echo "3. Пересоберите и перезапустите контейнер" 