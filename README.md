# 🛒 Marketplace Full-Stack Application

**Autor:** Rodrigo Espinoza  
**Stack:** MERN (MongoDB → SQLite3, Express, React, Node.js)

Aplicación de marketplace completa con autenticación, gestión de productos y sistema de mensajería.

---

## 📋 Características

### Autenticación y Autorización
- ✅ Registro de usuarios con selección de rol (Comprador/Vendedor)
- ✅ Autenticación basada en JWT
- ✅ Hash seguro de contraseñas con bcrypt
- ✅ Rutas protegidas y middleware de autorización

### Gestión de Productos
- ✅ CRUD completo de productos (solo vendedores)
- ✅ Categorías y búsqueda de productos
- ✅ Filtrado por precio
- ✅ Soporte para imágenes
- ✅ Control de stock

### Características de Usuario
- ✅ Perfiles de usuario
- ✅ Control de acceso basado en roles
- ✅ Gestión de cuentas

### Sistema de Mensajería
- 📦 Modelo de conversaciones listo
- 📦 Modelo de mensajes listo
- 📦 Controladores y rutas preparados

---

## 🚀 Stack Tecnológico

### Backend
- **Node.js** & **Express.js** - Framework del servidor
- **SQLite3** & **Sequelize** - Base de datos y ORM
- **JWT** - Autenticación
- **bcryptjs** - Hash de contraseñas
- **express-validator** - Validación de entrada
- **CORS** - Compartición de recursos entre orígenes

### Frontend
- **React** - Librería de UI
- **React Hooks** - Gestión de estado
- **Fetch API** - Peticiones HTTP
- **CSS3** - Estilos

---

## 📁 Estructura del Proyecto

```
marketplace-app/
├── Backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── sequelizeInstance.js  ← Nueva instancia de Sequelize
│   │   │   └── db.js                 ← Configuración y sincronización
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── userController.js
│   │   │   ├── productController.js
│   │   │   ├── conversationController.js
│   │   │   └── messageController.js
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js
│   │   │   ├── validation.js
│   │   │   └── errorHandler.js
│   │   ├── models/
│   │   │   ├── userModel.js
│   │   │   ├── productModel.js
│   │   │   ├── conversationModel.js
│   │   │   └── messageModel.js
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── userRoutes.js
│   │   │   ├── productRoutes.js
│   │   │   ├── conversationRoutes.js
│   │   │   └── messageRoutes.js
│   │   └── index.js
│   ├── database.sqlite              ← Base de datos SQLite (se crea automáticamente)
│   ├── .env
│   └── package.json
│
└── Frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Register.js
    │   │   ├── Login.js
    │   │   ├── ProductList.js
    │   │   ├── CreateProduct.js
    │   │   └── UserProfile.js
    │   ├── App.js
    │   ├── App.css
    │   ├── index.js
    │   └── index.css
    └── package.json
```

---

## 🛠️ Instalación y Configuración

### Requisitos Previos

#### Para Arch Linux
```bash
# Actualizar el sistema
sudo pacman -Syu

# Instalar Node.js y npm
sudo pacman -S nodejs npm

# Verificar instalación
node --version
npm --version
```

#### Para Ubuntu/Debian
```bash
# Actualizar repositorios
sudo apt update && sudo apt upgrade

# Instalar Node.js (vía NodeSource para versión LTS)
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt install -y nodejs

# Verificar instalación
node --version
npm --version
```

---

### Configuración del Backend

#### 1. Navegar a la carpeta del backend
```bash
cd Backend
```

#### 2. Instalar dependencias
```bash
npm install
```

**Dependencias principales instaladas:**
- `sequelize` - ORM para SQLite
- `sqlite3` - Driver de base de datos
- `express` - Framework web
- `bcryptjs` - Hash de contraseñas
- `jsonwebtoken` - Autenticación JWT
- `express-validator` - Validación de datos
- `cors` - CORS
- `dotenv` - Variables de entorno

#### 3. Crear archivo `.env`

**Arch Linux:**
```bash
touch .env
nano .env  # o usa vim/nvim
```

**Ubuntu:**
```bash
touch .env
nano .env
```

#### 4. Configurar variables de entorno en `.env`

```env
PORT=5000
NODE_ENV=development
JWT_SECRET=tu_clave_secreta_super_segura_aqui
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:3000
```

#### 5. Iniciar el servidor backend

**Modo desarrollo (con auto-recarga):**
```bash
npm run dev
```

**Modo producción:**
```bash
npm start
```

**Salida esperada:**
```
✅ SQLite Connection has been established successfully.
✅ All models were synchronized successfully.
Server running on port 5000
```

El backend estará disponible en: `http://localhost:5000`

**Nota:** El archivo `database.sqlite` se creará automáticamente en la raíz de `Backend/`.

---

### Configuración del Frontend

#### 1. Navegar a la carpeta del frontend
```bash
cd Frontend
```

#### 2. Instalar dependencias
```bash
npm install
```

#### 3. Iniciar servidor de desarrollo
```bash
npm start
```

El frontend estará disponible en: `http://localhost:3000`

---

## 📡 Endpoints de la API

### Autenticación
```
POST   /api/auth/register    - Registrar nuevo usuario
POST   /api/auth/login       - Iniciar sesión
GET    /api/auth/me          - Obtener usuario actual (protegido)
```

### Usuarios
```
GET    /api/users            - Obtener todos los usuarios (protegido)
GET    /api/users/:id        - Obtener usuario por ID (protegido)
PUT    /api/users/:id        - Actualizar usuario (protegido)
DELETE /api/users/:id        - Eliminar usuario (protegido)
```

### Productos
```
GET    /api/products         - Obtener todos los productos (público)
GET    /api/products/:id     - Obtener producto por ID (público)
POST   /api/products         - Crear producto (solo vendedor)
PUT    /api/products/:id     - Actualizar producto (solo propietario)
DELETE /api/products/:id     - Eliminar producto (solo propietario)
GET    /api/products/seller/:sellerId - Obtener productos del vendedor
```

### Conversaciones
```
GET    /api/conversations    - Obtener conversaciones del usuario (protegido)
POST   /api/conversations    - Crear conversación (protegido)
GET    /api/conversations/:id - Obtener conversación por ID (protegido)
DELETE /api/conversations/:id - Eliminar conversación (protegido)
```

### Mensajes
```
GET    /api/messages/:conversationId - Obtener mensajes (protegido)
POST   /api/messages         - Enviar mensaje (protegido)
PUT    /api/messages/:conversationId/read - Marcar como leído (protegido)
```

---

## 🧪 Pruebas de la Aplicación

### 1. Registrar Usuarios

**Cuenta de Vendedor:**
- Usuario: `vendedor1`
- Email: `vendedor@test.com`
- Contraseña: `password123`
- Rol: Vendedor

**Cuenta de Comprador:**
- Usuario: `comprador1`
- Email: `comprador@test.com`
- Contraseña: `password123`
- Rol: Comprador

### 2. Crear Productos (como Vendedor)
1. Iniciar sesión con cuenta de vendedor
2. Ir a la pestaña "Crear Producto"
3. Llenar los datos del producto
4. Enviar formulario

### 3. Explorar Productos (como Comprador)
1. Iniciar sesión con cuenta de comprador
2. Ver productos en la página principal
3. Usar búsqueda y filtros
4. Ver detalles de productos

---

## 🔒 Características de Seguridad

- ✅ Hash de contraseñas con bcrypt
- ✅ Autenticación con tokens JWT
- ✅ Rutas protegidas
- ✅ Validación de entrada
- ✅ Configuración CORS
- ✅ Control de acceso basado en roles
- ✅ Prevención de inyección SQL (Sequelize)
- ✅ Protección XSS

---

## 🛠️ Solución de Problemas Comunes

### El backend no inicia

**Arch Linux:**
```bash
# Verificar que Node.js está instalado
node --version

# Verificar que el archivo .env existe
ls -la .env

# Verificar que el puerto 5000 no está en uso
sudo lsof -i :5000
# o
sudo netstat -tulpn | grep 5000
```

**Ubuntu:**
```bash
# Verificar que Node.js está instalado
node --version

# Verificar que el archivo .env existe
ls -la .env

# Verificar que el puerto 5000 no está en uso
sudo lsof -i :5000
```

### El frontend no se conecta al backend
```bash
# Asegurarse de que el backend esté corriendo en el puerto 5000
# Verificar la configuración de CORS
# Verificar las URLs de la API en el código del frontend
```

### Errores de autenticación
```bash
# Limpiar localStorage del navegador (F12 → Application → Local Storage → Clear)
# Verificar que JWT_SECRET esté configurado en .env
# Verificar el formato del token en las peticiones
```

### Error "Cannot access 'sequelize' before initialization"
```bash
# Verificar que userModel.js importa desde sequelizeInstance.js:
# import sequelize from '../config/sequelizeInstance.js';

# NO desde db.js:
# import { sequelize } from '../config/db.js'; ❌
```

---

## 🔄 Migración de MongoDB a SQLite3

### Cambios Principales Realizados

1. **Dependencias:**
   - ❌ Eliminado: `mongoose`, `mongodb`
   - ✅ Agregado: `sequelize`, `sqlite3`

2. **Configuración:**
   - Nuevo archivo: `sequelizeInstance.js` (rompe dependencia circular)
   - Modificado: `db.js` (importa modelos y sincroniza)

3. **Modelos:**
   - Migrados de Mongoose Schema a Sequelize `define()`
   - Hooks de Mongoose → Hooks de Sequelize
   - `_id` autoincremental en lugar de ObjectId

4. **Controladores:**
   - `.find()` → `.findAll()`
   - `.findById()` → `.findByPk()`
   - `.create()` → `.create()`
   - `{ email }` → `{ where: { email } }`
   - `.populate()` → `.include()`

---

## 📦 Variables de Entorno

### Backend (.env)
```env
PORT=5000
NODE_ENV=development
JWT_SECRET=clave_secreta_super_segura
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:3000
```

**Nota:** Ya no se necesita `MONGODB_URI` porque SQLite es un archivo local.

---

## 🚧 Mejoras Futuras

- [ ] Mensajería en tiempo real con Socket.io
- [ ] Integración de pagos
- [ ] Reseñas y calificaciones de productos
- [ ] Sistema de gestión de pedidos
- [ ] Panel de administración
- [ ] Notificaciones por email
- [ ] Carga de imágenes
- [ ] Búsqueda avanzada con Elasticsearch
- [ ] Carrito de compras
- [ ] Lista de deseos

---

## 📄 Licencia

Este proyecto es de código abierto bajo la licencia MIT.

---

## 🤝 Contribuciones

¡Contribuciones, issues y solicitudes de funcionalidades son bienvenidas!

---

## 📧 Contacto

**Rodrigo Espinoza**

---

**Construido con ❤️ usando MERN Stack (SQLite3 + Express + React + Node.js)**
