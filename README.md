# GeoHod React Frontend

React приложение для Telegram Web App GeoHod.

## Разработка

### Установка зависимостей

```bash
npm install
```

### Запуск в режиме разработки

```bash
npm start
```

### Сборка для продакшена

```bash
npm run build:telegram
```

## Деплой с Podman

### Быстрый старт

```bash
# Сборка и деплой в production
./scripts/quick-deploy.sh production

# Сборка и деплой в dev с кастомным тегом
./scripts/quick-deploy.sh dev v1.0.0
```

### Ручная сборка и деплой

```bash
# Сборка образа
./scripts/build.sh v1.0.0

# Деплой
./scripts/deploy.sh production v1.0.0
```

### Мониторинг

```bash
# Проверка статуса
./scripts/monitor.sh

# Просмотр логов
podman logs -f geohod-frontend-production
```

### Очистка

```bash
# Очистка неиспользуемых ресурсов
./scripts/cleanup.sh
```

### Интеграция с backend

```bash
# Настройка интеграции с backend API
./scripts/integrate-backend.sh https://app.geohod.ru

# Проверка интеграции
./scripts/check-integration.sh
```

### HTTPS для Telegram Web App

```bash
# Настройка SSL сертификатов
.\scripts\setup-ssl.ps1

# Деплой с HTTPS
.\scripts\deploy-https.ps1 production latest
```

**Важно**: Telegram Web App требует HTTPS для работы!

## Установка systemd сервиса

Для автоматического запуска при перезагрузке сервера:

```bash
sudo ./scripts/install-service.sh
```

## GitHub Actions

### Настройка автоматического деплоя

1. **Настройте сервер**:

   ```bash
   # Подключитесь к серверу
   ssh root@62.169.22.36

   # Клонируйте репозиторий
   git clone https://github.com/your-username/geohod_react.git
   cd geohod_react

   # Создайте production пользователя
   sudo ./scripts/setup-server.sh geohod_frontend
   sudo passwd geohod_frontend

   # Создайте development пользователя
   sudo ./scripts/setup-server.sh geohod_frontend_dev
   sudo passwd geohod_frontend_dev
   ```

2. **Добавьте GitHub Secrets**:

   - `PROD_SERVER_HOST` - `62.169.22.36`
   - `PROD_SERVER_USER` - `geohod_frontend`
   - `PROD_SERVER_PASSWORD` - пароль пользователя geohod_frontend
   - `DEV_SERVER_USER` - `geohod_frontend_dev`
   - `DEV_SERVER_PASSWORD` - пароль пользователя geohod_frontend_dev

3. **Создайте GitHub Environments**:
   - Environment `production` с секретами для production
   - Environment `development` с секретами для development

Подробная инструкция: [GITHUB_SECRETS_SETUP.md](GITHUB_SECRETS_SETUP.md)

### Автоматический деплой:

- Push в `main` → деплой в production
- Push в `develop` → деплой в development

### Ручной деплой:

- Перейдите в Actions → Frontend Deploy → Run workflow

## Документация

Подробная документация по деплою: [DEPLOY.md](./DEPLOY.md)

## Структура проекта

```
src/
├── api/              # API клиенты
├── components/       # React компоненты
├── pages/           # Страницы приложения
├── stores/          # Zustand стейт менеджмент
├── types/           # TypeScript типы
├── utils/           # Утилиты
└── config/          # Конфигурация

scripts/             # Скрипты деплоя
├── build.sh         # Сборка образа
├── deploy.sh        # Деплой контейнера
├── cleanup.sh       # Очистка ресурсов
├── monitor.sh       # Мониторинг
└── quick-deploy.sh  # Быстрый деплой
```

## Переменные окружения

Скопируйте `env.example` в `.env` и настройте:

```bash
cp env.example .env
```

## Технологии

- React 19
- TypeScript
- Material-UI
- Zustand
- Axios
- Telegram Web App API
- Podman
- Nginx
