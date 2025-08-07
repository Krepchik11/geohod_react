#!/bin/bash

# Скрипт для очистки неиспользуемых образов и контейнеров

set -e

echo "🧹 Очистка неиспользуемых ресурсов..."

# Удаляем остановленные контейнеры
echo "🗑️ Удаляем остановленные контейнеры..."
podman container prune -f

# Удаляем неиспользуемые образы
echo "🗑️ Удаляем неиспользуемые образы..."
podman image prune -f

# Удаляем неиспользуемые volumes
echo "🗑️ Удаляем неиспользуемые volumes..."
podman volume prune -f

# Удаляем неиспользуемые сети
echo "🗑️ Удаляем неиспользуемые сети..."
podman network prune -f

echo "✅ Очистка завершена!"

# Показываем статистику
echo "📊 Статистика после очистки:"
echo "Контейнеры:"
podman ps -a --format "table {{.Names}}\t{{.Status}}\t{{.Image}}"
echo ""
echo "Образы:"
podman images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}" 