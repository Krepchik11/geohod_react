# Настройка SSH ключей для деплоя

## 🔧 Настройка на сервере

### 1. Подключитесь к серверу
```bash
ssh root@62.169.22.36
```

### 2. Клонируйте репозиторий
```bash
git clone https://github.com/your-username/geohod_react.git
cd geohod_react
```

### 3. Создайте пользователей и настройте SSH ключи
```bash
# Создайте production пользователя
sudo ./scripts/setup-server.sh geohod_frontend

# Создайте development пользователя
sudo ./scripts/setup-server.sh geohod_frontend_dev

# Настройте SSH ключи для production
sudo ./scripts/setup-ssh-keys.sh geohod_frontend

# Настройте SSH ключи для development
sudo ./scripts/setup-ssh-keys.sh geohod_frontend_dev
```

### 4. Скопируйте приватные ключи

После выполнения скриптов вы увидите приватные ключи. Скопируйте их:

**Для production пользователя (geohod_frontend):**
- Скопируйте весь блок между `=== НАЧАЛО ПРИВАТНОГО КЛЮЧА ===` и `=== КОНЕЦ ПРИВАТНОГО КЛЮЧА ===`

**Для development пользователя (geohod_frontend_dev):**
- Скопируйте весь блок между `=== НАЧАЛО ПРИВАТНОГО КЛЮЧА ===` и `=== КОНЕЦ ПРИВАТНОГО КЛЮЧА ===`

## 🔐 Настройка GitHub Secrets

### 1. Добавьте секреты в GitHub

Перейдите в Settings → Secrets and variables → Actions и добавьте:

| Имя | Значение |
|-----|----------|
| `PROD_SERVER_HOST` | `62.169.22.36` |
| `PROD_SERVER_USER` | `geohod_frontend` |
| `PROD_SSH_PRIVATE_KEY` | [приватный ключ geohod_frontend] |
| `DEV_SERVER_USER` | `geohod_frontend_dev` |
| `DEV_SSH_PRIVATE_KEY` | [приватный ключ geohod_frontend_dev] |

### 2. Создайте GitHub Environments

**Environment "production":**
- Settings → Environments → New environment
- Имя: `production`
- Добавьте секреты: `PROD_SERVER_HOST`, `PROD_SERVER_USER`, `PROD_SSH_PRIVATE_KEY`

**Environment "development":**
- Settings → Environments → New environment
- Имя: `development`
- Добавьте секреты: `PROD_SERVER_HOST`, `DEV_SERVER_USER`, `DEV_SSH_PRIVATE_KEY`

## ✅ Проверка настройки

### 1. Тест SSH подключения
```bash
# Тест production пользователя
ssh geohod_frontend@62.169.22.36

# Тест development пользователя
ssh geohod_frontend_dev@62.169.22.36
```

### 2. Тест деплоя
```bash
# Сделайте коммит для тестирования
git add .
git commit -m "Test SSH keys deploy"
git push origin develop
```

## 🔧 Troubleshooting

### Проблема: "Permission denied (publickey)"
```bash
# Проверьте права на .ssh директорию
sudo ls -la /home/geohod_frontend/.ssh/
sudo ls -la /home/geohod_frontend_dev/.ssh/

# Исправьте права если нужно
sudo chmod 700 /home/geohod_frontend/.ssh/
sudo chmod 600 /home/geohod_frontend/.ssh/authorized_keys
sudo chmod 700 /home/geohod_frontend_dev/.ssh/
sudo chmod 600 /home/geohod_frontend_dev/.ssh/authorized_keys
```

### Проблема: "SSH key not found"
```bash
# Пересоздайте SSH ключи
sudo ./scripts/setup-ssh-keys.sh geohod_frontend
sudo ./scripts/setup-ssh-keys.sh geohod_frontend_dev
```

### Проблема: "Host key verification failed"
```bash
# Добавьте сервер в known_hosts
ssh-keyscan -H 62.169.22.36 >> ~/.ssh/known_hosts
```

## 🎯 Готово!

После настройки SSH ключей:
- ✅ GitHub Actions будет использовать SSH ключи вместо паролей
- ✅ Более безопасная аутентификация
- ✅ Автоматический деплой будет работать стабильно 