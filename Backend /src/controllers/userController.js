// Backend /src/controllers/userController.js (MIGRACIÓN COMPLETA A SEQUELIZE)
import { User } from '../config/db.js'; // Importamos el modelo User
import { Op } from 'sequelize'; // Para usar operadores de Sequelize

// @desc    Get all users
// @route   GET /api/users
// @access  Private
export const getUsers = async (req, res) => {
  try {
    const { role, search, page = 1, limit = 10 } = req.query;
    
    const limitInt = parseInt(limit);
    const offset = (parseInt(page) - 1) * limitInt;
    
    const whereClause = {};
    
    // Filter by role if provided
    if (role) {
      whereClause.role = role;
    }
    
    // Search by username or email
    if (search) {
      whereClause[Op.or] = [
        { username: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } }
      ];
    }
    
    // Sequelize: Find all users with pagination
    const { count, rows: users } = await User.findAndCountAll({
      where: whereClause,
      limit: limitInt,
      offset: offset,
      order: [['createdAt', 'DESC']],
      // defaultScope en el modelo User ya excluye la contraseña
    });

    // Aseguramos que los datos devueltos usen el método toJSON del modelo
    const formattedUsers = users.map(user => user.toJSON());

    res.status(200).json({
      success: true,
      data: formattedUsers,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limitInt)
      }
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching users',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private
export const getUserById = async (req, res) => {
  try {
    // Sequelize: Find by Primary Key (findByPk)
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    res.status(200).json({
      success: true,
      data: user.toJSON() // Usamos toJSON para excluir la contraseña
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/:id
// @access  Private
export const updateUser = async (req, res) => {
  try {
    const { username, email, avatar } = req.body;

    // Check if user is updating their own profile
    if (req.params.id !== (req.user._id || req.user.id).toString()) {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized to update this profile' 
      });
    }

    // Sequelize: Find by Primary Key
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    // Update fields and use .save()
    if (username) user.username = username;
    if (email) user.email = email;
    if (avatar) user.avatar = avatar;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: user.toJSON()
    });

  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error updating profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Delete user (soft delete)
// @route   DELETE /api/users/:id
// @access  Private
export const deleteUser = async (req, res) => {
  try {
    // Check if user is deleting their own account
    if (req.params.id !== (req.user._id || req.user.id).toString()) {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized to delete this account' 
      });
    }

    // Sequelize: Find by Primary Key
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    // Soft delete - just deactivate and save
    user.isActive = false;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Account deactivated successfully'
    });

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error deleting account',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};