FROM denoland/deno:latest

WORKDIR /app

# Копируем только deno.json и tsconfig.json для кэширования зависимостей
COPY deno.json .
COPY tsconfig.json ./tsconfig.json
RUN deno cache --node-modules-dir deno.json

# Копируем только необходимые файлы проекта
COPY src ./src
COPY vite.config.ts .
COPY public ./public 

# Удаляем любые остатки node_modules
RUN rm -rf /app/node_modules

# Запускаем dev-режим
CMD ["deno", "task", "dev"]