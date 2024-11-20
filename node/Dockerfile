FROM node:22.7.0-alpine

WORKDIR /var/www

COPY package*.json ./

RUN npm install

COPY src/ ./src/
COPY src/public/ ./public/

EXPOSE 3000
CMD ["node", "src/server.js"]