# Deployment Setup (Podman Compose)

## One-Time Server Setup
- **Install Podman & Podman Compose**
  - Follow official documentation for your OS.
- **Create Deploy User & Directories**
  ```bash
  # As root or with sudo
  sudo useradd -m -s /bin/bash deployer
  sudo mkdir -p /home/deployer/frontend-app
  sudo chown -R deployer:deployer /home/deployer
  ```
- **Enable User Lingering**
  ```bash
  # As root or with sudo
  sudo loginctl enable-linger deployer
  ```
- **SSH Access**
  - Add the public key for the `VPS_SSH_KEY` secret to `~/.ssh/authorized_keys` for the `deployer` user.

## Running a Deployment
- **Configure GitHub Secrets & Variables**
  - `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY`
  - `YOUR_DOMAIN`, `YOUR_EMAIL`
- **Run GitHub Action**
  - Go to **Actions** -> **Deploy Frontend** -> **Run workflow**.