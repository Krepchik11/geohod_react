#!/bin/bash

# Создаем папку ssl если её нет
mkdir -p ssl

# Генерируем приватный ключ
openssl genrsa -out ssl/privkey.pem 2048

# Генерируем сертификат
openssl req -new -x509 -key ssl/privkey.pem -out ssl/fullchain.pem -days 365 -config ssl/openssl.conf

echo "SSL сертификаты созданы в папке ssl/"
echo "privkey.pem - приватный ключ"
echo "fullchain.pem - сертификат" 