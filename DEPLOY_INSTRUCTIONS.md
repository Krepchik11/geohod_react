# Инструкция по настройке деплоя

## 🚀 Быстрая настройка

### 1. Настройка сервера

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

### 2. Настройка SSH ключей

```bash
# На сервере настройте SSH ключи
sudo ./scripts/setup-ssh-keys.sh geohod_frontend
sudo ./scripts/setup-ssh-keys.sh geohod_frontend_dev
```

### 3. Настройка GitHub Secrets

Добавьте в Settings → Secrets and variables → Actions:

| Имя                    | Значение                             |
| ---------------------- | ------------------------------------ |
| `PROD_SERVER_HOST`     | `62.169.22.36`                       |
| `PROD_SERVER_USER`     | `geohod_frontend`                    |
| `PROD_SSH_PRIVATE_KEY` | [приватный ключ geohod_frontend]     |
| `DEV_SERVER_USER`      | `geohod_frontend_dev`                |
| `DEV_SSH_PRIVATE_KEY`  | [приватный ключ geohod_frontend_dev] |

Подробная инструкция: [SSH_KEYS_SETUP.md](SSH_KEYS_SETUP.md)

### 4. Создание GitHub Environments

1. **Environment "production"**:

   - Settings → Environments → New environment
   - Имя: `production`
   - Добавьте секреты: `PROD_SERVER_HOST`, `PROD_SERVER_USER`, `PROD_SSH_PRIVATE_KEY`

2. **Environment "development"**:
   - Settings → Environments → New environment
   - Имя: `development`
   - Добавьте секреты: `PROD_SERVER_HOST`, `DEV_SERVER_USER`, `DEV_SSH_PRIVATE_KEY`

## 🔄 Автоматический деплой

### Production (main ветка)

```bash
git add .
git commit -m "Deploy to production"
git push origin main
```

### Development (develop ветка)

```bash
git add .
git commit -m "Deploy to development"
git push origin develop
```

## 📊 Мониторинг

### Проверка статуса на сервере

```bash
# Статус сервисов
sudo systemctl status geohod-frontend-geohod_frontend.service
sudo systemctl status geohod-frontend-geohod_frontend_dev.service

# Контейнеры
sudo -u geohod_frontend podman ps
sudo -u geohod_frontend_dev podman ps

# Логи
sudo journalctl -u geohod-frontend-geohod_frontend.service -f
sudo journalctl -u geohod-frontend-geohod_frontend_dev.service -f
```

### Доступ к приложениям

- **Production**: http://62.169.22.36:8080
- **Development**: http://62.169.22.36:8081

## 🛠️ Ручное управление

### Перезапуск сервисов

```bash
# Production
sudo systemctl restart geohod-frontend-geohod_frontend.service

# Development
sudo systemctl restart geohod-frontend-geohod_frontend_dev.service
```

### Очистка старых образов

```bash
# Production
sudo -u geohod_frontend podman image prune -f

# Development
sudo -u geohod_frontend_dev podman image prune -f
```

### Просмотр логов контейнеров

```bash
# Production
sudo -u geohod_frontend podman logs geohod-frontend-production

# Development
sudo -u geohod_frontend_dev podman logs geohod-frontend-dev
```

## 🔧 Troubleshooting

### Проблема: "Permission denied"

```bash
# Проверьте права пользователя
sudo -u geohod_frontend ls -la /home/geohod_frontend/
sudo -u geohod_frontend_dev ls -la /home/geohod_frontend_dev/
```

### Проблема: "Container failed to start"

```bash
# Проверьте логи контейнера
sudo -u geohod_frontend podman logs geohod-frontend-production
sudo -u geohod_frontend_dev podman logs geohod-frontend-dev
```

### Проблема: "Port already in use"

```bash
# Проверьте занятые порты
sudo netstat -tlnp | grep :8080
sudo netstat -tlnp | grep :8081
```

## 📋 Чек-лист

- [ ] Сервер настроен с podman
- [ ] Пользователи созданы (geohod_frontend, geohod_frontend_dev)
- [ ] GitHub Secrets добавлены
- [ ] GitHub Environments созданы
- [ ] Первый деплой прошел успешно
- [ ] Приложения доступны по портам 8080 и 8081
- [ ] Логи показывают успешный запуск

## 🎯 Готово!

После выполнения всех шагов у вас будет:

- ✅ Автоматический деплой с main → production
- ✅ Автоматический деплой с develop → development
- ✅ Изолированные пользователи для безопасности
- ✅ Podman вместо Docker
- ✅ Systemd сервисы для автозапуска
- ✅ Мониторинг и логирование
