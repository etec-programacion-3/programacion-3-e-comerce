# 🛒 Mercado no Libre - Marketplace Full-Stack

**Autor:** Rodrigo Espinoza Squef
**Stack:** SQLite3 + Express + React + Node.js

Aplicación de marketplace con autenticación, gestión de productos y sistema de mensajería.

---

## ✨ Características Principales

- ✅ Autenticación JWT (Login/Registro)
- ✅ CRUD de productos (solo vendedores)
- ✅ Sistema de mensajería entre usuarios
- ✅ Subida de imágenes
- ✅ Búsqueda y filtros de productos
- ✅ Perfiles de usuario personalizables

---

## 🛠️ Instalación Rápida

### 📦 Requisitos Previos

#### Para Arch Linux:
```bash
# Actualizar sistema e instalar dependencias
sudo pacman -Syu
sudo pacman -S nodejs npm base-devel git
```

#### Para Ubuntu/Debian:
```bash
# Actualizar sistema e instalar Node.js LTS
sudo apt update && sudo apt upgrade
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt install -y nodejs build-essential git
```

Verificar instalación:
```bash
node --version
npm --version
```

---

## 🚀 Configuración del Proyecto

### 1️⃣ Clonar el repositorio
```bash
git clone <url-del-repositorio>
cd marketplace-app
```

---

### 2️⃣ Configurar Backend

```bash
# Entrar a la carpeta del backend
cd Backend

# Instalar dependencias
npm install

# Crear archivo de configuración
cp .env.example .env

# Editar .env y configurar (opcional, ya tiene valores por defecto)
nano .env
```

**Contenido del `.env`:**
```env
PORT=4000
NODE_ENV=development
JWT_SECRET=tu_clave_secreta_super_segura_aqui
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:3000
```

**Crear carpetas de uploads:**
```bash
mkdir -p uploads/products uploads/users
```

**Iniciar el backend:**
```bash
# Modo desarrollo (con auto-recarga)
npm run dev

# O modo normal
npm start
```

✅ **Backend corriendo en:** `http://localhost:4000`

---

### 3️⃣ Configurar Frontend

**Abrir una NUEVA terminal:**

```bash
# Entrar a la carpeta del frontend
cd frontend

# Instalar dependencias
npm install

# Iniciar el frontend
npm start
```

✅ **Frontend corriendo en:** `http://localhost:3000`

---

## 🎯 Resumen de Comandos

### Backend (Terminal 1):
```bash
cd Backend
npm install              # Solo la primera vez
npm run dev             # Iniciar servidor
```

### Frontend (Terminal 2):
```bash
cd frontend
npm install              # Solo la primera vez
npm start               # Iniciar aplicación
```

---

## 📡 Endpoints Principales

```
# Autenticación
POST   /api/auth/register     - Registrar usuario
POST   /api/auth/login        - Iniciar sesión

# Productos
GET    /api/products          - Listar productos
POST   /api/products          - Crear producto (vendedor)
PUT    /api/products/:id      - Actualizar producto
DELETE /api/products/:id      - Eliminar producto

# Mensajería
GET    /api/conversations                - Mis conversaciones
POST   /api/conversations                - Crear conversación
GET    /api/conversations/:id/messages   - Obtener mensajes
POST   /api/conversations/:id/messages   - Enviar mensaje
```

---

## 🧪 Probar la Aplicación

### 1. Crear cuentas de prueba:

**Vendedor:**
- Email: `vendedor@test.com`
- Contraseña: `password123`
- Rol: Vendedor

**Comprador:**
- Email: `comprador@test.com`
- Contraseña: `password123`
- Rol: Comprador

### 2. Flujo de uso:
1. Registrarse como vendedor
2. Crear productos desde el menú lateral (☰)
3. Cerrar sesión y registrarse como comprador
4. Ver productos y contactar al vendedor
5. Enviar mensajes desde la sección "Mensajes"

---

## 🔧 Solución de Problemas

### El puerto 4000 está ocupado:
```bash
# Matar el proceso
sudo kill -9 $(lsof -t -i:4000)

# O cambiar el puerto en Backend/.env
PORT=5000
```

### Error al instalar dependencias:

**Arch Linux:**
```bash
sudo pacman -S base-devel python
npm cache clean --force
npm install
```

**Ubuntu:**
```bash
sudo apt install build-essential python3
npm cache clean --force
npm install
```

### El frontend no se conecta al backend:
```bash
# Verificar que el backend esté corriendo
curl http://localhost:4000/

# Verificar el archivo frontend/.env
cat frontend/.env
# Debe contener: REACT_APP_API_URL=http://localhost:4000/api
```

### Limpiar y reinstalar todo:
```bash
# Backend
cd Backend
rm -rf node_modules package-lock.json
npm install

# Frontend
cd ../frontend
rm -rf node_modules package-lock.json
npm install
```

---

## 📁 Estructura del Proyecto

```
marketplace-app/
├── Backend/
│   ├── src/
│   │   ├── controllers/     # Lógica de negocio
│   │   ├── models/          # Modelos de datos
│   │   ├── routes/          # Rutas de la API
│   │   ├── middleware/      # Autenticación y validación
│   │   └── config/          # Configuración de BD
│   ├── uploads/             # Imágenes subidas
│   ├── database.sqlite      # Base de datos (se crea automáticamente)
│   └── .env                 # Variables de entorno
│
└── frontend/
    ├── src/
    │   ├── components/      # Componentes React
    │   ├── context/         # Estado global
    │   └── services/        # Llamadas a la API
    └── .env                 # URL del backend
```

---

## 🔒 Seguridad

- ✅ Contraseñas hasheadas con bcrypt
- ✅ Autenticación con JWT
- ✅ Validación de datos en cliente y servidor
- ✅ CORS configurado
- ✅ Control de acceso por roles
- ✅ Límite de tamaño de archivos (5MB)

---

## 🎓 Tecnologías Utilizadas

**Backend:**
- Node.js + Express
- SQLite3 + Sequelize
- JWT + bcrypt
- Multer (uploads)

**Frontend:**
- React + React Router
- Context API
- React Hot Toast
- CSS3 moderno
