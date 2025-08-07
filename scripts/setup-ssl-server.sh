#!/bin/bash

# Скрипт для настройки SSL на сервере
# Использование: sudo ./setup-ssl-server.sh [domain]

set -e

if [ $# -eq 0 ]; then
    echo "Использование: $0 <domain>"
    echo "Пример: $0 app.geohod.ru"
    exit 1
fi

DOMAIN=$1
echo "Настройка SSL для домена: $DOMAIN"

# Устанавливаем certbot
echo "Устанавливаем certbot..."
apt update
apt install -y certbot

# Получаем SSL сертификат
echo "Получаем SSL сертификат для $DOMAIN..."
certbot certonly --standalone -d $DOMAIN

# Создаем директорию для SSL в проекте
echo "Копируем сертификаты в проект..."
mkdir -p /home/geohod_frontend/ssl
cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem /home/geohod_frontend/ssl/
cp /etc/letsencrypt/live/$DOMAIN/privkey.pem /home/geohod_frontend/ssl/

# Устанавливаем права
chown -R geohod_frontend:geohod_frontend /home/geohod_frontend/ssl
chmod 600 /home/geohod_frontend/ssl/*.pem

echo "SSL сертификаты настроены!"
echo ""
echo "Сертификаты скопированы в:"
echo "/home/geohod_frontend/ssl/fullchain.pem"
echo "/home/geohod_frontend/ssl/privkey.pem"
echo ""
echo "Следующие шаги:"
echo "1. Обновите nginx конфигурацию для домена $DOMAIN"
echo "2. Пересоберите и перезапустите контейнер"
echo "3. Настройте автоматическое обновление сертификатов" 