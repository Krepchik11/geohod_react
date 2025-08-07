#!/bin/bash

# Скрипт для настройки development среды
# Использование: ./setup-development.sh [dev-domain] [dev-bot-username]

set -e

if [ $# -lt 2 ]; then
    echo "Использование: $0 <dev-domain> <dev-bot-username>"
    echo "Пример: $0 dev-app.geohod.ru geohod_dev_bot"
    exit 1
fi

DEV_DOMAIN=$1
DEV_BOT_USERNAME=$2

echo "Настройка development среды..."
echo "Домен: $DEV_DOMAIN"
echo "Бот: $DEV_BOT_USERNAME"

# Создаем .env.development
cat > .env.development << EOF
# Development Environment
REACT_APP_API_URL=https://$DEV_DOMAIN/api/v1
REACT_APP_BOT_USERNAME=$DEV_BOT_USERNAME
VITE_BOT_USERNAME=$DEV_BOT_USERNAME
NODE_ENV=development
REACT_APP_TELEGRAM_WEBAPP=true
GENERATE_SOURCEMAP=true
EOF

# Создаем nginx конфигурацию для development
cat > nginx-dev.conf << EOF
# Development server configuration
server {
    listen 8081;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # Security headers for Telegram Web App
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' https: data: blob: 'unsafe-inline'; frame-ancestors 'self' https://web.telegram.org;" always;

    # Static files caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # API proxy to backend
    location /api/ {
        proxy_pass https://$DEV_DOMAIN;
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
EOF

echo "Development среда настроена!"
echo ""
echo "Следующие шаги:"
echo "1. Добавьте .env.development в .gitignore"
echo "2. Обновите GitHub Actions для использования разных конфигураций"
echo "3. Настройте SSL сертификат для $DEV_DOMAIN"
echo "4. Обновите бота в Telegram для использования $DEV_BOT_USERNAME" 