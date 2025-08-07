#!/bin/bash

# Скрипт для деплоя с podman
# Использование: ./scripts/deploy.sh [environment] [tag]

set -e

# Получаем параметры
ENVIRONMENT=${1:-production}
TAG=${2:-latest}
CONTAINER_NAME="geohod-frontend-$ENVIRONMENT"
IMAGE_NAME="geohod-frontend"

echo "🚀 Деплой $IMAGE_NAME:$TAG в окружение $ENVIRONMENT..."

# Останавливаем существующий контейнер если он запущен
if podman ps -q -f name=$CONTAINER_NAME | grep -q .; then
    echo "🛑 Останавливаем существующий контейнер..."
    podman stop $CONTAINER_NAME
fi

# Удаляем существующий контейнер
if podman ps -aq -f name=$CONTAINER_NAME | grep -q .; then
    echo "🗑️ Удаляем существующий контейнер..."
    podman rm $CONTAINER_NAME
fi

# Удаляем старые образы (оставляем только последние 3)
echo "🧹 Очистка старых образов..."
podman images $IMAGE_NAME --format "table {{.Repository}}:{{.Tag}}\t{{.CreatedAt}}" | tail -n +2 | sort -k2 -r | tail -n +4 | awk '{print $1}' | xargs -r podman rmi

# Запускаем новый контейнер
echo "▶️ Запускаем новый контейнер..."
podman run -d \
    --name $CONTAINER_NAME \
    --restart unless-stopped \
    -p 8080:8080 \
    -e NODE_ENV=production \
    $IMAGE_NAME:$TAG

echo "✅ Деплой завершен успешно!"

# Показываем статус контейнера
echo "📊 Статус контейнера:"
podman ps -f name=$CONTAINER_NAME

# Показываем логи
echo "📋 Последние логи:"
podman logs --tail 10 $CONTAINER_NAME 