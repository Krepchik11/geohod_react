# Скрипт для интеграции с backend API (PowerShell версия)
# Использование: .\scripts\integrate-backend.ps1 [backend_url]

param(
    [string]$BackendUrl = "https://app.geohod.ru"
)

Write-Host "Integration with backend API: $BackendUrl" -ForegroundColor Green

# Проверяем доступность backend
Write-Host "Checking backend availability..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$BackendUrl/api/v1/health" -Method GET -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "Backend is available" -ForegroundColor Green
    } else {
        Write-Host "Backend is not available, but continuing setup" -ForegroundColor Yellow
    }
} catch {
    Write-Host "Backend is not available, but continuing setup" -ForegroundColor Yellow
}

# Обновляем конфигурацию nginx
Write-Host "Updating nginx configuration..." -ForegroundColor Yellow
$nginxConfig = @"
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    # Logging
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;
    error_log /var/log/nginx/error.log warn;

    # Basic settings
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;

    # Gzip compression
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

        # Security
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header Referrer-Policy "no-referrer-when-downgrade" always;
        add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

        # Static files caching
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }

        # API proxy to backend
        location /api/ {
            proxy_pass $BackendUrl;
            proxy_set_header Host `$host;
            proxy_set_header X-Real-IP `$remote_addr;
            proxy_set_header X-Forwarded-For `$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto `$scheme;
            proxy_set_header X-Forwarded-Host `$host;
            proxy_set_header X-Forwarded-Port `$server_port;
            
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
            try_files `$uri `$uri/ /index.html;
        }

        # Error handling
        error_page 404 /index.html;
        error_page 500 502 503 504 /50x.html;
        location = /50x.html {
            root /usr/share/nginx/html;
        }
    }
}
"@

$nginxConfig | Out-File -FilePath "nginx.conf" -Encoding UTF8
Write-Host "Nginx configuration updated" -ForegroundColor Green

# Обновляем переменные окружения
Write-Host "Updating environment variables..." -ForegroundColor Yellow
$envConfig = @"
# API Configuration
REACT_APP_API_URL=$BackendUrl/api/v1
VITE_API_URL=$BackendUrl/api/v1

# Telegram Bot Configuration
REACT_APP_BOT_USERNAME=geohod_bot
VITE_BOT_USERNAME=geohod_bot

# Environment
NODE_ENV=production
REACT_APP_TELEGRAM_WEBAPP=true

# Build Configuration
GENERATE_SOURCEMAP=false
"@

$envConfig | Out-File -FilePath "env.example" -Encoding UTF8
Write-Host "Environment variables updated" -ForegroundColor Green

Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Rebuild image: .\scripts\build.ps1" -ForegroundColor White
Write-Host "2. Restart container: .\scripts\deploy.ps1 production" -ForegroundColor White
Write-Host "3. Check integration: .\scripts\check-integration.ps1" -ForegroundColor White 