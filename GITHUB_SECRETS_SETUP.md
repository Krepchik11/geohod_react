# Настройка GitHub Secrets для деплоя

## Необходимые секреты

Добавьте следующие секреты в настройках репозитория (Settings → Secrets and variables → Actions):

### 1. PROD_SERVER_HOST

- **Значение**: IP адрес вашего сервера (например: `62.169.22.36`)

### 2. PROD_SERVER_USER

- **Значение**: `geohod_frontend`

### 3. PROD_SERVER_PASSWORD

- **Значение**: Пароль пользователя `geohod_frontend`

### 4. DEV_SERVER_USER

- **Значение**: `geohod_frontend_dev`

### 5. DEV_SERVER_PASSWORD

- **Значение**: Пароль пользователя `geohod_frontend_dev`

## Настройка сервера

### 1. Подключитесь к серверу

```bash
ssh root@62.169.22.36
```

### 2. Создайте production пользователя

```bash
# Клонируйте репозиторий
git clone https://github.com/your-username/geohod_react.git
cd geohod_react

# Запустите скрипт настройки
sudo ./scripts/setup-server.sh geohod_frontend

# Установите пароль для пользователя
sudo passwd geohod_frontend
```

### 3. Создайте development пользователя

```bash
# Создайте dev пользователя
sudo ./scripts/setup-server.sh geohod_frontend_dev

# Установите пароль для dev пользователя
sudo passwd geohod_frontend_dev
```

### 4. Проверьте настройку

```bash
# Проверьте статус сервисов
sudo systemctl status geohod-frontend-geohod_frontend.service
sudo systemctl status geohod-frontend-geohod_frontend_dev.service

# Проверьте podman
sudo -u geohod_frontend podman --version
sudo -u geohod_frontend_dev podman --version
```

## Настройка GitHub Environments

### 1. Создайте Environment "production"

1. Перейдите в Settings → Environments
2. Нажмите "New environment"
3. Введите имя: `production`
4. Добавьте секреты:
   - `PROD_SERVER_HOST`
   - `PROD_SERVER_USER`
   - `PROD_SERVER_PASSWORD`

### 2. Создайте Environment "development"

1. Нажмите "New environment"
2. Введите имя: `development`
3. Добавьте секреты:
   - `PROD_SERVER_HOST` (тот же сервер)
   - `DEV_SERVER_USER`
   - `DEV_SERVER_PASSWORD`

## Тестирование деплоя

### 1. Тест production деплоя

```bash
# Сделайте коммит в main ветку
git add .
git commit -m "Test production deploy"
git push origin main
```

### 2. Тест development деплоя

```bash
# Сделайте коммит в develop ветку
git add .
git commit -m "Test development deploy"
git push origin develop
```

### 3. Проверьте логи

```bash
# На сервере проверьте логи
sudo journalctl -u geohod-frontend-geohod_frontend.service -f
sudo journalctl -u geohod-frontend-geohod_frontend_dev.service -f
```

## Полезные команды

### Проверка контейнеров

```bash
# Список контейнеров
sudo -u geohod_frontend podman ps
sudo -u geohod_frontend_dev podman ps

# Логи контейнеров
sudo -u geohod_frontend podman logs geohod-frontend-production
sudo -u geohod_frontend_dev podman logs geohod-frontend-dev
```

### Перезапуск сервисов

```bash
# Перезапуск production
sudo systemctl restart geohod-frontend-geohod_frontend.service

# Перезапуск development
sudo systemctl restart geohod-frontend-geohod_frontend_dev.service
```

### Очистка старых образов

```bash
# Очистка для production пользователя
sudo -u geohod_frontend podman image prune -f

# Очистка для development пользователя
sudo -u geohod_frontend_dev podman image prune -f
```

## Troubleshooting

### Проблема: "Permission denied"

```bash
# Проверьте права пользователя
sudo -u geohod_frontend ls -la /home/geohod_frontend/
sudo -u geohod_frontend_dev ls -la /home/geohod_frontend_dev/
```

### Проблема: "Podman not found"

```bash
# Переустановите podman
sudo apt update
sudo apt install -y podman podman-compose
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

# Остановите конфликтующие процессы
sudo systemctl stop conflicting-service
```
