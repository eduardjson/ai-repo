FROM node:24-slim

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

EXPOSE 5174

# Remote запускается в dev-режиме (как и хост `client` в docker-compose).
# Module Federation отдаёт `remoteEntry.js` с dev-сервера на порту 5174.
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5174"]
