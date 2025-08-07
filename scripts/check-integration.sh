#!/bin/bash

# Скрипт для проверки интеграции с backend

set -e

echo "🔍 Проверка интеграции с backend..."

# Проверяем доступность backend
echo "1. Проверка доступности backend..."
if curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL/api/v1/health" | grep -q "200"; then
    echo "✅ Backend доступен"
else
    echo "❌ Backend недоступен"
    exit 1
fi

# Проверяем контейнер
echo "2. Проверка контейнера..."
if podman ps -q -f name=geohod-frontend-production | grep -q .; then
    echo "✅ Контейнер запущен"
else
    echo "❌ Контейнер не запущен"
    exit 1
fi

# Проверяем проксирование API
echo "3. Проверка проксирования API..."
if curl -s -o /dev/null -w "%{http_code}" "http://localhost:8080/api/v1/health" | grep -q "200"; then
    echo "✅ API проксирование работает"
else
    echo "❌ API проксирование не работает"
    exit 1
fi

echo "✅ Все проверки пройдены успешно!"
