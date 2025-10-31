// Backend /src/middleware/authMiddleware.js (MODIFICADO)
import jwt from 'jsonwebtoken';
// Importamos User desde la nueva configuración de DB
import { User } from '../config/db.js'; 
import { Op } from 'sequelize'; // Necesario para consultas complejas (aunque no se usa en este archivo)

// Protect routes - verify JWT token
export const protect = async (req, res, next) => {
  let token;

  // Check for Bearer token in Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Extract token
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Sequelize: Get user from token (findByPk = Find by Primary Key)
      req.user = await User.findByPk(decoded.id); // <-- CAMBIO

      if (!req.user) {
        return res.status(401).json({ 
          success: false,
          message: 'User not found' 
        });
      }

      if (!req.user.isActive) {
        return res.status(403).json({ 
          success: false,
          message: 'Account is deactivated' 
        });
      }

      next();
      
    } catch (error) {
      console.error('Token verification error:', error);
      return res.status(401).json({ 
        success: false,
        message: 'Not authorized, token failed' 
      });
    }
  }

  if (!token) {
    return res.status(401).json({ 
      success: false,
      message: 'Not authorized, no token provided' 
    });
  }
};

// Restrict to specific roles (NO CAMBIOS en el código interno)
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user.role}' is not authorized to access this route`
      });
    }
    next();
  };
};