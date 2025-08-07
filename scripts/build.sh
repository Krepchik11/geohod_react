#!/bin/bash

# Скрипт для сборки образа с podman
# Использование: ./scripts/build.sh [tag]

set -e

# Получаем тег из аргумента или используем latest
TAG=${1:-latest}
IMAGE_NAME="geohod-frontend"

echo "🔨 Сборка образа $IMAGE_NAME:$TAG..."

# Собираем образ
podman build -t $IMAGE_NAME:$TAG .

echo "✅ Образ $IMAGE_NAME:$TAG успешно собран!"

# Показываем информацию об образе
echo "📊 Информация об образе:"
podman images $IMAGE_NAME:$TAG 