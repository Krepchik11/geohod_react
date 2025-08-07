#!/bin/bash

# Скрипт для установки systemd сервиса
# Требует sudo права

set -e

SERVICE_NAME="geohod-frontend"
SERVICE_FILE="scripts/geohod-frontend.service"
SERVICE_PATH="/etc/systemd/system/$SERVICE_NAME.service"

echo "🔧 Установка systemd сервиса $SERVICE_NAME..."

# Проверяем права
if [ "$EUID" -ne 0 ]; then
    echo "❌ Этот скрипт требует sudo права"
    exit 1
fi

# Копируем файл сервиса
echo "📋 Копируем файл сервиса..."
cp $SERVICE_FILE $SERVICE_PATH

# Перезагружаем systemd
echo "🔄 Перезагружаем systemd..."
systemctl daemon-reload

# Включаем автозапуск
echo "✅ Включаем автозапуск сервиса..."
systemctl enable $SERVICE_NAME

echo "✅ Сервис $SERVICE_NAME установлен и включен!"
echo ""
echo "📋 Команды для управления сервисом:"
echo "  Запуск: sudo systemctl start $SERVICE_NAME"
echo "  Остановка: sudo systemctl stop $SERVICE_NAME"
echo "  Перезапуск: sudo systemctl restart $SERVICE_NAME"
echo "  Статус: sudo systemctl status $SERVICE_NAME"
echo "  Логи: sudo journalctl -u $SERVICE_NAME -f" 