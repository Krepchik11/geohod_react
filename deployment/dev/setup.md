# Development Deployment Setup (Podman Compose)

## One-Time Server Setup
- **Install Podman & Podman Compose**
  - Follow official documentation for your OS.
- **Create Deploy User & Directories**
  ```bash
  # As root or with sudo
  sudo useradd -m -s /bin/bash geohod
  sudo mkdir -p /home/geohod/frontend-app-dev
  sudo chown -R geohod:geohod /home/geohod
  ```
- **Enable User Lingering**
  ```bash
  # As root or with sudo
  sudo loginctl enable-linger geohod
  ```
- **SSH Access**
  - Add the public key for the `VPS_SSH_KEY` secret to `~/.ssh/authorized_keys` for the `geohod` user.

## Running a Development Deployment
- **Configure GitHub Secrets & Variables**
  - `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY`
  - `YOUR_DOMAIN`, `YOUR_EMAIL`
- **Run GitHub Action**
  - Go to **Actions** -> **Deploy Frontend (Dev)** -> **Run workflow**.
  