#!/bin/bash

# Скрипт для настройки сервера для деплоя frontend
# Использование: sudo ./setup-server.sh [username]

set -e

if [ $# -eq 0 ]; then
    echo "Использование: $0 <username>"
    echo "Пример: $0 geohod_frontend"
    exit 1
fi

USERNAME=$1
echo "Настройка сервера для пользователя: $USERNAME"

# Обновляем систему
echo "Обновляем систему..."
apt update && apt upgrade -y

# Устанавливаем podman
echo "Устанавливаем podman..."
apt install -y podman podman-compose

# Создаем пользователя
echo "Создаем пользователя $USERNAME..."
useradd -m -s /bin/bash $USERNAME

# Добавляем пользователя в группу podman
echo "Добавляем пользователя в группу podman..."
usermod -aG podman $USERNAME

# Создаем директории для проекта
echo "Создаем директории..."
mkdir -p /home/$USERNAME/geohod-frontend
chown -R $USERNAME:$USERNAME /home/$USERNAME/geohod-frontend

# Настраиваем podman для пользователя
echo "Настраиваем podman для пользователя..."
sudo -u $USERNAME mkdir -p /home/$USERNAME/.config/containers
cat > /home/$USERNAME/.config/containers/containers.conf << EOF
[engine]
network_cmd_options = ["slirp4netns"]

[network]
default_subnet_pools = [
  {"base" = "10.89.0.0/16", "size" = 24},
  {"base" = "10.90.0.0/15", "size" = 24},
]
EOF

chown -R $USERNAME:$USERNAME /home/$USERNAME/.config

# Создаем systemd сервис
echo "Создаем systemd сервис..."
cat > /etc/systemd/system/geohod-frontend-$USERNAME.service << EOF
[Unit]
Description=GeoHod Frontend Container ($USERNAME)
After=network.target

[Service]
Type=oneshot
RemainAfterExit=yes
User=$USERNAME
Group=$USERNAME
WorkingDirectory=/home/$USERNAME/geohod-frontend
ExecStartPre=/usr/bin/podman container prune -f
ExecStart=/usr/bin/podman run --name geohod-frontend-$USERNAME --restart unless-stopped -p 8080:8080 -e NODE_ENV=production geohod-frontend:latest
ExecStop=/usr/bin/podman stop geohod-frontend-$USERNAME
ExecStopPost=/usr/bin/podman rm geohod-frontend-$USERNAME

[Install]
WantedBy=multi-user.target
EOF

# Перезагружаем systemd
systemctl daemon-reload

# Включаем автозапуск сервиса
systemctl enable geohod-frontend-$USERNAME.service

echo "Настройка завершена!"
echo ""
echo "Следующие шаги:"
echo "1. Добавьте GitHub Secrets:"
echo "   - PROD_SERVER_HOST: $(hostname -I | awk '{print $1}')"
echo "   - PROD_SERVER_USER: $USERNAME"
echo "   - PROD_SERVER_PASSWORD: [пароль пользователя]"
echo "   - DEV_SERVER_USER: ${USERNAME}_dev"
echo "   - DEV_SERVER_PASSWORD: [пароль dev пользователя]"
echo ""
echo "2. Создайте dev пользователя:"
echo "   sudo ./setup-server.sh ${USERNAME}_dev"
echo ""
echo "3. Проверьте настройку:"
echo "   sudo systemctl status geohod-frontend-$USERNAME.service" 