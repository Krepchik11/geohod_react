#!/bin/bash

# Скрипт для создания пользователей для деплоя
# Использование: sudo ./create-users.sh

set -e

echo "Создание пользователей для деплоя..."

# Создаем production пользователя
echo "Создаем пользователя geohod_frontend..."
useradd -m -s /bin/bash geohod_frontend
echo "geohod_frontend:geohod_frontend123" | chpasswd

# Создаем development пользователя
echo "Создаем пользователя geohod_frontend_dev..."
useradd -m -s /bin/bash geohod_frontend_dev
echo "geohod_frontend_dev:geohod_frontend_dev123" | chpasswd

# Добавляем пользователей в группу sudo
usermod -aG sudo geohod_frontend
usermod -aG sudo geohod_frontend_dev

# Создаем директории
mkdir -p /home/geohod_frontend/geohod-frontend
mkdir -p /home/geohod_frontend_dev/geohod-frontend

# Устанавливаем права
chown -R geohod_frontend:geohod_frontend /home/geohod_frontend
chown -R geohod_frontend_dev:geohod_frontend_dev /home/geohod_frontend_dev

echo "Пользователи созданы!"
echo ""
echo "Пароли пользователей:"
echo "geohod_frontend: geohod_frontend123"
echo "geohod_frontend_dev: geohod_frontend_dev123"
echo ""
echo "Теперь выполните:"
echo "sudo ./scripts/setup-server.sh geohod_frontend"
echo "sudo ./scripts/setup-server.sh geohod_frontend_dev"
echo "sudo ./scripts/setup-ssh-keys.sh geohod_frontend"
echo "sudo ./scripts/setup-ssh-keys.sh geohod_frontend_dev" 