// Backend/src/controllers/productController.js
import { Product, User } from '../config/db.js';
import { validationResult } from 'express-validator';
import { Op } from 'sequelize';

// @desc    Create a new product
// @route   POST /api/products
// @access  Private (Seller only)
export const createProduct = async (req, res) => {
  try {
    // Validación de errores de express-validator
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Errores de validación',
        errors: errors.array()
      });
    }

    // Verificar que el usuario sea vendedor
    if (req.user.role !== 'vendedor') {
      return res.status(403).json({
        success: false,
        message: 'Solo los vendedores pueden crear productos'
      });
    }

    const { name, description, price, category, stock, image } = req.body;

    // Crear el producto
    const newProduct = await Product.create({
      name,
      description,
      price,
      category,
      stock: stock || 0,
      image: image || 'https://via.placeholder.com/400x300?text=Producto',
      sellerId: req.user._id
    });

    res.status(201).json({
      success: true,
      message: 'Producto creado exitosamente',
      data: newProduct.toJSON()
    });

  } catch (error) {
    console.error('Error creating product:', error);
    
    // Manejar errores de validación de Sequelize
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Errores de validación',
        errors: error.errors.map(e => ({ field: e.path, message: e.message }))
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error al crear el producto',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get all products (with pagination, filters, and search)
// @route   GET /api/products
// @access  Public
export const getAllProducts = async (req, res) => {
  try {
    // Parámetros de paginación
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Parámetros de filtrado
    const { category, minPrice, maxPrice, search, sellerId } = req.query;

    // Construir condiciones de búsqueda
    const whereConditions = {
      isActive: true
    };

    // Filtro por categoría
    if (category) {
      whereConditions.category = category;
    }

    // Filtro por rango de precio
    if (minPrice || maxPrice) {
      whereConditions.price = {};
      if (minPrice) {
        whereConditions.price[Op.gte] = parseFloat(minPrice);
      }
      if (maxPrice) {
        whereConditions.price[Op.lte] = parseFloat(maxPrice);
      }
    }

    // Filtro por vendedor
    if (sellerId) {
      whereConditions.sellerId = parseInt(sellerId);
    }

    // Búsqueda por nombre o descripción
    if (search) {
      whereConditions[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }

    // Ejecutar consulta con paginación
    const { count, rows: products } = await Product.findAndCountAll({
      where: whereConditions,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      include: [{
        model: User,
        as: 'seller',
        attributes: ['_id', 'username', 'email', 'avatar']
      }]
    });

    // Calcular metadatos de paginación
    const totalPages = Math.ceil(count / limit);

    res.status(200).json({
      success: true,
      data: products.map(p => p.toJSON()),
      pagination: {
        currentPage: page,
        totalPages,
        totalProducts: count,
        productsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });

  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener los productos',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findOne({
      where: { _id: id, isActive: true },
      include: [{
        model: User,
        as: 'seller',
        attributes: ['_id', 'username', 'email', 'avatar']
      }]
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      data: product.toJSON()
    });

  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener el producto',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private (Owner only)
export const updateProduct = async (req, res) => {
  try {
    // Validación de errores de express-validator
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Errores de validación',
        errors: errors.array()
      });
    }

    const { id } = req.params;

    // Buscar el producto
    const product = await Product.findOne({
      where: { _id: id, isActive: true }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    // Verificar que el usuario sea el propietario del producto
    if (product.sellerId !== req.user._id) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para actualizar este producto'
      });
    }

    // Actualizar solo los campos proporcionados
    const { name, description, price, category, stock, image } = req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = price;
    if (category !== undefined) updateData.category = category;
    if (stock !== undefined) updateData.stock = stock;
    if (image !== undefined) updateData.image = image;

    // Actualizar el producto
    await product.update(updateData);

    // Obtener el producto actualizado con el vendedor
    const updatedProduct = await Product.findOne({
      where: { _id: id },
      include: [{
        model: User,
        as: 'seller',
        attributes: ['_id', 'username', 'email', 'avatar']
      }]
    });

    res.status(200).json({
      success: true,
      message: 'Producto actualizado exitosamente',
      data: updatedProduct.toJSON()
    });

  } catch (error) {
    console.error('Error updating product:', error);

    // Manejar errores de validación de Sequelize
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Errores de validación',
        errors: error.errors.map(e => ({ field: e.path, message: e.message }))
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error al actualizar el producto',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Delete product (soft delete)
// @route   DELETE /api/products/:id
// @access  Private (Owner only)
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Buscar el producto
    const product = await Product.findOne({
      where: { _id: id, isActive: true }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    // Verificar que el usuario sea el propietario del producto
    if (product.sellerId !== req.user._id) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para eliminar este producto'
      });
    }

    // Soft delete: marcar como inactivo en lugar de eliminar
    await product.update({ isActive: false });

    res.status(200).json({
      success: true,
      message: 'Producto eliminado exitosamente'
    });

  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar el producto',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get products by seller ID
// @route   GET /api/products/seller/:sellerId
// @access  Public
export const getProductsBySeller = async (req, res) => {
  try {
    const { sellerId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Verificar que el vendedor existe
    const seller = await User.findByPk(sellerId);
    if (!seller || seller.role !== 'vendedor') {
      return res.status(404).json({
        success: false,
        message: 'Vendedor no encontrado'
      });
    }

    // Obtener productos del vendedor
    const { count, rows: products } = await Product.findAndCountAll({
      where: { 
        sellerId: parseInt(sellerId),
        isActive: true 
      },
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      include: [{
        model: User,
        as: 'seller',
        attributes: ['_id', 'username', 'email', 'avatar']
      }]
    });

    const totalPages = Math.ceil(count / limit);

    res.status(200).json({
      success: true,
      data: products.map(p => p.toJSON()),
      pagination: {
        currentPage: page,
        totalPages,
        totalProducts: count,
        productsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });

  } catch (error) {
    console.error('Error fetching seller products:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener los productos del vendedor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
