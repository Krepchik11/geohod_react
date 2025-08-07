#!/bin/bash

# Быстрый деплой с автоматической сборкой
# Использование: ./scripts/quick-deploy.sh [environment] [tag]

set -e

ENVIRONMENT=${1:-production}
TAG=${2:-$(git rev-parse --short HEAD)}

echo "🚀 Быстрый деплой в $ENVIRONMENT с тегом $TAG..."

# Проверяем что мы в git репозитории
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "❌ Не найден git репозиторий"
    exit 1
fi

# Проверяем что нет незакоммиченных изменений
if ! git diff-index --quiet HEAD --; then
    echo "⚠️  Внимание: есть незакоммиченные изменения"
    read -p "Продолжить деплой? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Деплой отменен"
        exit 1
    fi
fi

# Собираем образ
echo "🔨 Сборка образа..."
./scripts/build.sh $TAG

# Деплоим
echo "🚀 Деплой..."
./scripts/deploy.sh $ENVIRONMENT $TAG

echo "✅ Быстрый деплой завершен!"
echo "📊 Приложение доступно на порту 8080"
echo "🔗 http://localhost:8080" 