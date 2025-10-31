// Backend /src/controllers/authController.js (MODIFICADO)
import { User } from '../config/db.js'; 
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import { Op } from 'sequelize'; // Importamos Op para usar OR en la consulta

// Generate JWT Token (NO CAMBIOS, usa user._id del modelo)
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user._id || user.id, // Usa _id o id
      role: user.role,
      email: user.email 
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    // ... (Manejo de errores de validación)

    const { username, email, password, role } = req.body;

    // Sequelize: Check if user already exists
    const existingUser = await User.findOne({ 
      where: { 
        [Op.or]: [{ email }, { username }] // <-- CAMBIO: Usar Op.or
      }
    }); 

    if (existingUser) {
      // ... (Lógica de error de usuario existente)
      return res.status(400).json({ 
        success: false,
        message: existingUser.email === email 
          ? 'Email already registered' 
          : 'Username already taken'
      });
    }

    // Sequelize: Create new user (hashing done in model hook)
    const newUser = await User.create({ // <-- CAMBIO
      username,
      email,
      password, // El hook del modelo hashea la contraseña antes de guardarla
      role: role || 'comprador'
    });

    // Generate token
    const token = generateToken(newUser);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: newUser.toJSON(), // Usamos toJSON del modelo
        token
      }
    });

  } catch (error) {
    console.error('Register error:', error);
    // ... (Manejo de errores)
    res.status(500).json({ 
      success: false,
      message: 'Error registering user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    // ... (Manejo de errores de validación)

    const { email, password } = req.body;

    // Sequelize: Find user by email. Usamos .scope(null) para incluir la columna 'password'
    const user = await User.scope(null).findOne({ // <-- CAMBIO
      where: { email }
    });
    
    if (!user) {
      // ... (Error de credenciales)
    }

    // Check if user is active
    if (!user.isActive) {
      // ... (Error de cuenta desactivada)
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      // ... (Error de credenciales)
    }

    // Generate token
    const token = generateToken(user);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: user.toJSON(), // Usamos toJSON del modelo
        token
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    // ... (Manejo de errores)
    res.status(500).json({ 
      success: false,
      message: 'Error during login',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    // req.user está poblado por el middleware 'protect'
    const user = req.user; 
    
    if (!user) {
      // ... (User not found)
    }

    res.status(200).json({
      success: true,
      data: user.toJSON() // Usamos toJSON del modelo
    });

  } catch (error) {
    console.error('Get profile error:', error);
    // ... (Manejo de errores)
    res.status(500).json({ 
      success: false,
      message: 'Error fetching profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};