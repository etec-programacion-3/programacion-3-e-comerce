// Backend/src/middleware/productValidation.js (CORREGIDO)
import { body } from 'express-validator';

// Validación para crear producto
export const validateCreateProduct = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('El nombre del producto es requerido')
    .isLength({ min: 3, max: 100 })
    .withMessage('El nombre debe tener entre 3 y 100 caracteres'),

  body('description')
    .trim()
    .notEmpty()
    .withMessage('La descripción es requerida')
    .isLength({ min: 10, max: 2000 })
    .withMessage('La descripción debe tener entre 10 y 2000 caracteres'),

  body('price')
    .notEmpty()
    .withMessage('El precio es requerido')
    .isFloat({ min: 0.01 })
    .withMessage('El precio debe ser un número mayor a 0'),

  body('category')
    .trim()
    .notEmpty()
    .withMessage('La categoría es requerida')
    .isIn(['Electrónica', 'Ropa', 'Hogar', 'Deportes', 'Libros', 'Juguetes', 'Alimentos', 'Otros'])
    .withMessage('Categoría no válida'),

  body('stock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('El stock debe ser un número entero mayor o igual a 0'),

  // --- CAMBIO AQUÍ ---
  body('image')
    .optional()
    .isString() // CAMBIADO DE .isURL() a .isString()
    .withMessage('La imagen debe ser un enlace de texto')
];

// Validación para actualizar producto
export const validateUpdateProduct = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('El nombre debe tener entre 3 y 100 caracteres'),

  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('La descripción debe tener entre 10 y 2000 caracteres'),

  body('price')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('El precio debe ser un número mayor a 0'),

  body('category')
    .optional()
    .trim()
    .isIn(['Electrónica', 'Ropa', 'Hogar', 'Deportes', 'Libros', 'Juguetes', 'Alimentos', 'Otros'])
    .withMessage('Categoría no válida'),

  body('stock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('El stock debe ser un número entero mayor o igual a 0'),

  // --- CAMBIO AQUÍ ---
  body('image')
    .optional()
    .isString() // CAMBIADO DE .isURL() a .isString()
    .withMessage('La imagen debe ser un enlace de texto')
];