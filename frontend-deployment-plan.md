# Frontend Deployment Plan

### 1. GitHub Actions Workflow

**File: `.github/workflows/deploy-frontend.yml`**
```yaml
name: Deploy Frontend

on:
  workflow_dispatch:

jobs:
  build_and_deploy:
    name: Build and Deploy Frontend
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm install

      - name: Build
        run: npm run build

      - name: Transfer assets to VPS
        uses: appleboy/scp-action@v1.0.0
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.VPS_SSH_KEY }}
          source: "dist"
          target: "~/frontend-app"

      - name: Transfer deployment files
        uses: appleboy/scp-action@v1.0.0
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.VPS_SSH_KEY }}
          source: "frontend-deployment/*"
          target: "~/frontend-app"
          strip_components: 1

      - name: Execute remote setup
        uses: appleboy/ssh-action@v1.0.0
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.VPS_SSH_KEY }}
          script: |
            set -e
            cd ~/frontend-app
            chmod +x install.sh
            ./install.sh
```

### 2. Podman Compose Configuration

**File: `frontend-deployment/podman-compose.yml`**
```yaml
services:
  nginx:
    image: docker.io/library/nginx:latest
    container_name: frontend-nginx
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ../dist:/usr/share/nginx/html:ro
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - certbot_certs:/etc/letsencrypt
    networks:
      - frontend-net

  certbot:
    image: docker.io/certbot/certbot:latest
    container_name: frontend-certbot
    restart: on-failure
    volumes:
      - certbot_certs:/etc/letsencrypt
    command: certonly --webroot --webroot-path=/usr/share/nginx/html --email your-email@example.com --agree-tos --no-eff-email -d your-domain.com
    networks:
      - frontend-net

volumes:
  certbot_certs:

networks:
  frontend-net:
```

### 3. Nginx Configuration

**File: `frontend-deployment/nginx.conf`**
```nginx
user nginx;
worker_processes auto;
pid /var/run/nginx.pid;

events {
    worker_connections 768;
}

http {
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;

    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;

    access_log /var/log/nginx/access.log;
    error_log /var/log/nginx/error.log;

    gzip on;
    gzip_disable "msie6";

    server {
        listen 80;
        server_name your-domain.com;
        location /.well-known/acme-challenge/ {
            root /usr/share/nginx/html;
        }
        location / {
            return 301 https://$host$request_uri;
        }
    }

    server {
        listen 443 ssl http2;
        server_name your-domain.com;

        ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

        root /usr/share/nginx/html;
        index index.html;

        location / {
            try_files $uri $uri/ /index.html;
        }
    }
}
```

### 4. systemd Unit File

**File: `frontend-deployment/frontend-app.service`**
```ini
[Unit]
Description=Frontend App Service
Wants=network-online.target
After=network-online.target

[Service]
Restart=always
Type=forking
TimeoutStartSec=5min

WorkingDirectory=%h/frontend-app
ExecStart=/usr/bin/podman-compose -f podman-compose.yml up -d
ExecStop=/usr/bin/podman-compose -f podman-compose.yml down

[Install]
WantedBy=default.target
```

### 5. Install Script

**File: `frontend-deployment/install.sh`**
```bash
#!/bin/bash
set -euo pipefail

STAGING_DIR="${HOME}/frontend-app"
SERVICE_NAME="frontend-app"
SERVICE_DIR="${HOME}/.config/systemd/user"

echo "--- Starting Frontend Deployment ---"

echo "--> Setting up systemd user service..."
mkdir -p "${SERVICE_DIR}"
cp "${STAGING_DIR}/${SERVICE_NAME}.service" "${SERVICE_DIR}/"
systemctl --user enable "${SERVICE_NAME}.service"

echo "--> Reloading systemd user daemon and restarting service..."
systemctl --user daemon-reload
systemctl --user restart "${SERVICE_NAME}"

echo "--- Frontend deployment finished ---"
```

### 6. One-Time Server Setup

**File: `frontend-deployment/setup.md`**
```markdown
# Deployment Setup (Podman Compose)

## One-Time Server Setup
- **Install Podman & Podman Compose**
  - Follow official documentation for your OS.
- **Create Deploy User & Directories**
  ```bash
  # As root or with sudo
  sudo useradd -m -s /bin/bash geohod
  sudo mkdir -p /home/geohod/frontend-app
  sudo chown -R geohod:geohod /home/geohod
  ```
- **Enable User Lingering**
  ```bash
  # As root or with sudo
  sudo loginctl enable-linger geohod
  ```
- **SSH Access**
  - Add the public key for the `VPS_SSH_KEY` secret to `~/.ssh/authorized_keys` for the `geohod` user.

## Running a Deployment
- **Configure GitHub Secrets & Variables**
  - `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY`
  - `YOUR_DOMAIN`, `YOUR_EMAIL`
- **Run GitHub Action**
  - Go to **Actions** -> **Deploy Frontend** -> **Run workflow**.