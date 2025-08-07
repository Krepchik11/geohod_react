#!/bin/bash

# Скрипт для интеграции с backend API
# Использование: ./scripts/integrate-backend.sh [backend_url]

set -e

BACKEND_URL=${1:-https://app.geohod.ru}

echo "🔗 Интеграция с backend API: $BACKEND_URL"

# Проверяем доступность backend
echo "🔍 Проверяем доступность backend..."
if curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL/api/v1/health" | grep -q "200"; then
    echo "✅ Backend доступен"
else
    echo "⚠️  Backend недоступен, но продолжаем настройку"
fi

# Обновляем конфигурацию nginx для проксирования API
echo "🔧 Обновляем конфигурацию nginx..."
cat > nginx.conf << 'EOF'
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    # Логирование
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;
    error_log /var/log/nginx/error.log warn;

    # Основные настройки
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;

    # Gzip сжатие
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;

    server {
        listen 8080;
        server_name localhost;
        root /usr/share/nginx/html;
        index index.html;

        # Безопасность
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header Referrer-Policy "no-referrer-when-downgrade" always;
        add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

        # Кэширование статических файлов
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }

        # API проксирование к backend
        location /api/ {
            proxy_pass BACKEND_URL;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_set_header X-Forwarded-Host $host;
            proxy_set_header X-Forwarded-Port $server_port;
            
            # Таймауты
            proxy_connect_timeout 30s;
            proxy_send_timeout 30s;
            proxy_read_timeout 30s;
            
            # Буферизация
            proxy_buffering on;
            proxy_buffer_size 4k;
            proxy_buffers 8 4k;
        }

        # Обработка React Router
        location / {
            try_files $uri $uri/ /index.html;
        }

        # Обработка ошибок
        error_page 404 /index.html;
        error_page 500 502 503 504 /50x.html;
        location = /50x.html {
            root /usr/share/nginx/html;
        }
    }
}
EOF

# Заменяем placeholder на реальный URL
sed -i "s|BACKEND_URL|$BACKEND_URL|g" nginx.conf

echo "✅ Конфигурация nginx обновлена"

# Обновляем переменные окружения
echo "🔧 Обновляем переменные окружения..."
cat > env.example << EOF
# API Configuration
REACT_APP_API_URL=$BACKEND_URL/api/v1
VITE_API_URL=$BACKEND_URL/api/v1

# Telegram Bot Configuration
REACT_APP_BOT_USERNAME=geohod_bot
VITE_BOT_USERNAME=geohod_bot

# Environment
NODE_ENV=production
REACT_APP_TELEGRAM_WEBAPP=true

# Build Configuration
GENERATE_SOURCEMAP=false
EOF

echo "✅ Переменные окружения обновлены"

# Создаем скрипт для проверки интеграции
echo "🔧 Создаем скрипт проверки интеграции..."
cat > scripts/check-integration.sh << 'EOF'
#!/bin/bash

# Скрипт для проверки интеграции с backend

set -e

echo "🔍 Проверка интеграции с backend..."

# Проверяем доступность backend
echo "1. Проверка доступности backend..."
if curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL/api/v1/health" | grep -q "200"; then
    echo "✅ Backend доступен"
else
    echo "❌ Backend недоступен"
    exit 1
fi

# Проверяем контейнер
echo "2. Проверка контейнера..."
if podman ps -q -f name=geohod-frontend-production | grep -q .; then
    echo "✅ Контейнер запущен"
else
    echo "❌ Контейнер не запущен"
    exit 1
fi

# Проверяем проксирование API
echo "3. Проверка проксирования API..."
if curl -s -o /dev/null -w "%{http_code}" "http://localhost:8080/api/v1/health" | grep -q "200"; then
    echo "✅ API проксирование работает"
else
    echo "❌ API проксирование не работает"
    exit 1
fi

echo "✅ Все проверки пройдены успешно!"
EOF

chmod +x scripts/check-integration.sh

echo "✅ Скрипт проверки интеграции создан"

echo ""
echo "📋 Следующие шаги:"
echo "1. Пересоберите образ: ./scripts/build.sh"
echo "2. Перезапустите контейнер: ./scripts/deploy.sh production"
echo "3. Проверьте интеграцию: ./scripts/check-integration.sh" 