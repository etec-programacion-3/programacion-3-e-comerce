# Usar Node.js
FROM node:20-alpine

WORKDIR /app

# Copiar dependencias e instalar
COPY package*.json ./
RUN npm install

# Copiar el resto de tu código React
COPY . .

# Exponer el puerto de React
EXPOSE 3000

# Comando para iniciar el entorno de desarrollo de React
CMD ["npm", "start"]