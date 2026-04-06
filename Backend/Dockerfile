FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN mkdir -p uploads/products uploads/users
EXPOSE 4000
CMD ["node", "src/index.js"]