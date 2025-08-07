#!/bin/bash

# Скрипт для мониторинга контейнеров
# Использование: ./scripts/monitor.sh [container_name]

set -e

CONTAINER_NAME=${1:-geohod-frontend-production}

echo "📊 Мониторинг контейнера $CONTAINER_NAME..."
echo ""

# Проверяем статус контейнера
echo "🔍 Статус контейнера:"
if podman ps -q -f name=$CONTAINER_NAME | grep -q .; then
    echo "✅ Контейнер запущен"
    podman ps -f name=$CONTAINER_NAME
else
    echo "❌ Контейнер не запущен"
    echo "Доступные контейнеры:"
    podman ps -a --format "table {{.Names}}\t{{.Status}}\t{{.Image}}"
    exit 1
fi

echo ""

# Показываем использование ресурсов
echo "💾 Использование ресурсов:"
podman stats --no-stream $CONTAINER_NAME

echo ""

# Показываем последние логи
echo "📋 Последние логи (10 строк):"
podman logs --tail 10 $CONTAINER_NAME

echo ""

# Проверяем доступность приложения
echo "🌐 Проверка доступности приложения:"
if curl -s -o /dev/null -w "%{http_code}" http://localhost:8080 | grep -q "200"; then
    echo "✅ Приложение доступно (HTTP 200)"
else
    echo "❌ Приложение недоступно"
fi

echo ""

# Показываем информацию о портах
echo "🔌 Информация о портах:"
podman port $CONTAINER_NAME

echo ""
echo "📋 Полезные команды:"
echo "  Логи в реальном времени: podman logs -f $CONTAINER_NAME"
echo "  Вход в контейнер: podman exec -it $CONTAINER_NAME sh"
echo "  Перезапуск: podman restart $CONTAINER_NAME" 