// Backend/src/index.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';

// Importar rutas
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import productRoutes from './routes/productRoutes.js';
import conversationRoutes from './routes/conversationRoutes.js';
import messageRoutes from './routes/messageRoutes.js';

// Importar middleware de manejo de errores
import { errorHandler } from './middleware/errorHandler.js';

// Cargar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ========================================
// MIDDLEWARE GLOBAL
// ========================================

// CORS - Permitir peticiones desde el frontend
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Body parser - Parsear JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ========================================
// RUTAS DE LA API
// ========================================

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API de Marketplace funcionando correctamente',
    version: '1.0.0'
  });
});

// Montar rutas
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes); // ← NUEVA RUTA
app.use('/api/conversations', conversationRoutes);
app.use('/api/messages', messageRoutes);

// Ruta 404 - No encontrada
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada'
  });
});

// ========================================
// MIDDLEWARE DE MANEJO DE ERRORES
// ========================================
app.use(errorHandler);

// ========================================
// INICIAR SERVIDOR
// ========================================

const startServer = async () => {
  try {
    // Conectar a la base de datos
    await connectDB();

    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 API URL: http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
