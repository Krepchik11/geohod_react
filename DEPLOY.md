# Деплой GeoHod Frontend с Podman

## Требования

- Podman установлен и настроен
- Node.js 18+ для локальной разработки
- Git для получения кода

## Структура проекта

```
geohod_react/
├── Dockerfile              # Многоэтапная сборка
├── nginx.conf              # Конфигурация nginx
├── .dockerignore           # Исключения для Docker
├── scripts/
│   ├── build.sh           # Сборка образа
│   ├── deploy.sh          # Деплой контейнера
│   ├── cleanup.sh         # Очистка ресурсов
│   ├── install-service.sh # Установка systemd сервиса
│   └── geohod-frontend.service # Systemd сервис
└── DEPLOY.md              # Эта документация
```

## Быстрый старт

### 1. Сборка образа

```bash
# Сборка с тегом latest
./scripts/build.sh

# Сборка с кастомным тегом
./scripts/build.sh v1.0.0
```

### 2. Деплой

```bash
# Деплой в production с тегом latest
./scripts/deploy.sh production

# Деплой в dev с кастомным тегом
./scripts/deploy.sh dev v1.0.0
```

### 3. Установка systemd сервиса (опционально)

```bash
# Установка сервиса (требует sudo)
sudo ./scripts/install-service.sh
```

## Управление контейнерами

### Просмотр контейнеров

```bash
podman ps -a
```

### Просмотр логов

```bash
# Логи конкретного контейнера
podman logs geohod-frontend-production

# Логи в реальном времени
podman logs -f geohod-frontend-production
```

### Остановка/запуск

```bash
# Остановка
podman stop geohod-frontend-production

# Запуск
podman start geohod-frontend-production

# Перезапуск
podman restart geohod-frontend-production
```

### Удаление

```bash
# Остановка и удаление контейнера
podman rm -f geohod-frontend-production

# Удаление образа
podman rmi geohod-frontend:latest
```

## Управление systemd сервисом

Если установлен systemd сервис:

```bash
# Запуск
sudo systemctl start geohod-frontend

# Остановка
sudo systemctl stop geohod-frontend

# Перезапуск
sudo systemctl restart geohod-frontend

# Статус
sudo systemctl status geohod-frontend

# Логи
sudo journalctl -u geohod-frontend -f

# Автозапуск
sudo systemctl enable geohod-frontend
```

## Очистка

```bash
# Очистка неиспользуемых ресурсов
./scripts/cleanup.sh
```

## Переменные окружения

Контейнер использует следующие переменные окружения:

- `NODE_ENV=production` - окружение приложения
- `PORT=8080` - порт для nginx (по умолчанию)

## Мониторинг

### Проверка здоровья приложения

```bash
curl http://localhost:8080
```

### Проверка логов nginx

```bash
podman exec geohod-frontend-production tail -f /var/log/nginx/access.log
podman exec geohod-frontend-production tail -f /var/log/nginx/error.log
```

## Безопасность

- Контейнер запускается от непривилегированного пользователя (nextjs:1001)
- Настроены security headers в nginx
- Используется Alpine Linux для минимального размера образа

## Troubleshooting

### Контейнер не запускается

```bash
# Проверка логов
podman logs geohod-frontend-production

# Проверка статуса
podman ps -a
```

### Проблемы с портами

```bash
# Проверка занятых портов
netstat -tlnp | grep 8080

# Изменение порта в deploy.sh
```

### Проблемы с правами

```bash
# Проверка прав на скрипты
chmod +x scripts/*.sh
```

## Версионирование

Рекомендуется использовать семантическое версионирование:

- `v1.0.0` - major.minor.patch
- `latest` - последняя версия
- `develop` - версия для разработки

## CI/CD

Для автоматического деплоя можно использовать GitHub Actions или GitLab CI:

```yaml
# Пример для GitHub Actions
- name: Build and Deploy
  run: |
    ./scripts/build.sh ${{ github.sha }}
    ./scripts/deploy.sh production ${{ github.sha }}
```
