# Многоэтапная сборка для оптимизации размера образа
FROM node:18-alpine AS builder

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем файлы зависимостей
COPY package*.json ./

# Устанавливаем зависимости
RUN npm ci --only=production

# Копируем исходный код
COPY . .

# Собираем приложение
RUN npm run build:telegram

# Продакшен этап
FROM nginx:alpine AS production

# Копируем собранное приложение
COPY --from=builder /app/build /usr/share/nginx/html

# Копируем конфигурацию nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Создаем директорию для SSL сертификатов
RUN mkdir -p /etc/nginx/ssl

# Копируем SSL сертификаты (если есть)
COPY ssl/ /etc/nginx/ssl/

# Копируем HTTPS конфигурацию (если есть)
COPY nginx-https.conf /etc/nginx/conf.d/https.conf 2>/dev/null || true

# Создаем пользователя для безопасности
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Меняем владельца файлов
RUN chown -R nextjs:nodejs /usr/share/nginx/html && \
    chown -R nextjs:nodejs /var/cache/nginx && \
    chown -R nextjs:nodejs /var/log/nginx && \
    chown -R nextjs:nodejs /etc/nginx/conf.d && \
    mkdir -p /run && \
    chown -R nextjs:nodejs /run

# Переключаемся на непривилегированного пользователя
# USER nextjs

# Открываем порт
EXPOSE 8080

# Запускаем nginx
CMD ["nginx", "-g", "daemon off;"] 