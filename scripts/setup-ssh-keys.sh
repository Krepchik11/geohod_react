#!/bin/bash

# Скрипт для настройки SSH ключей для деплоя
# Использование: ./setup-ssh-keys.sh [username]

set -e

if [ $# -eq 0 ]; then
    echo "Использование: $0 <username>"
    echo "Пример: $0 geohod_frontend"
    exit 1
fi

USERNAME=$1
echo "Настройка SSH ключей для пользователя: $USERNAME"

# Создаем директорию .ssh
sudo -u $USERNAME mkdir -p /home/$USERNAME/.ssh
sudo chmod 700 /home/$USERNAME/.ssh

# Создаем SSH ключ
echo "Генерируем SSH ключ..."
sudo -u $USERNAME ssh-keygen -t rsa -b 4096 -f /home/$USERNAME/.ssh/id_rsa -N ""

# Создаем authorized_keys
sudo -u $USERNAME touch /home/$USERNAME/.ssh/authorized_keys
sudo chmod 600 /home/$USERNAME/.ssh/authorized_keys

# Добавляем публичный ключ в authorized_keys
sudo -u $USERNAME cat /home/$USERNAME/.ssh/id_rsa.pub >> /home/$USERNAME/.ssh/authorized_keys

# Устанавливаем правильные права
sudo chown -R $USERNAME:$USERNAME /home/$USERNAME/.ssh

echo "SSH ключи настроены!"
echo ""
echo "Публичный ключ для GitHub Secrets:"
echo "=== НАЧАЛО ПУБЛИЧНОГО КЛЮЧА ==="
sudo cat /home/$USERNAME/.ssh/id_rsa.pub
echo "=== КОНЕЦ ПУБЛИЧНОГО КЛЮЧА ==="
echo ""
echo "Приватный ключ для GitHub Secrets:"
echo "=== НАЧАЛО ПРИВАТНОГО КЛЮЧА ==="
sudo cat /home/$USERNAME/.ssh/id_rsa
echo "=== КОНЕЦ ПРИВАТНОГО КЛЮЧА ===" 