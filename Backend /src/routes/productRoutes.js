// Backend/src/routes/productRoutes.js
import express from 'express';
import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getProductsBySeller
} from '../controllers/productController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';
import { validateCreateProduct, validateUpdateProduct } from '../middleware/productValidation.js';

const router = express.Router();

// ========================================
// RUTAS PÚBLICAS (sin autenticación)
// ========================================

// @route   GET /api/products
// @desc    Obtener todos los productos (con paginación y filtros)
// @access  Public
router.get('/', getAllProducts);

// @route   GET /api/products/seller/:sellerId
// @desc    Obtener productos de un vendedor específico
// @access  Public
// IMPORTANTE: Esta ruta debe ir ANTES de /api/products/:id
// para evitar que :id capture "seller"
router.get('/seller/:sellerId', getProductsBySeller);

// @route   GET /api/products/:id
// @desc    Obtener un producto por ID
// @access  Public
router.get('/:id', getProductById);

// ========================================
// RUTAS PROTEGIDAS (requieren autenticación)
// ========================================

// @route   POST /api/products
// @desc    Crear un nuevo producto
// @access  Private (solo vendedores)
router.post(
  '/',
  protect,
  restrictTo('vendedor'),
  validateCreateProduct,
  createProduct
);

// @route   PUT /api/products/:id
// @desc    Actualizar un producto
// @access  Private (solo el propietario del producto)
router.put(
  '/:id',
  protect,
  restrictTo('vendedor'),
  validateUpdateProduct,
  updateProduct
);

// @route   DELETE /api/products/:id
// @desc    Eliminar un producto (soft delete)
// @access  Private (solo el propietario del producto)
router.delete(
  '/:id',
  protect,
  restrictTo('vendedor'),
  deleteProduct
);

export default router;
