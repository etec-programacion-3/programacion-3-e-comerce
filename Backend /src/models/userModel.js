// Backend/src/models/userModel.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/sequelizeInstance.js'; // ✅ CAMBIO CRÍTICO: importar desde sequelizeInstance
import bcrypt from 'bcryptjs';

const User = sequelize.define('User', {
  _id: { 
    // Usamos _id como clave primaria para mantener la coherencia con el frontend y JWT
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  username: {
    type: DataTypes.STRING(30),
    allowNull: false,
    unique: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM('comprador', 'vendedor'),
    allowNull: false,
    defaultValue: 'comprador'
  },
  avatar: {
    type: DataTypes.STRING,
    defaultValue: 'https://via.placeholder.com/150'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  timestamps: true,
  hooks: {
    // Hook para hashear la contraseña antes de crear un nuevo usuario
    beforeCreate: async (user) => {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(user.password, salt);
    }
  },
  defaultScope: {
    // Excluir la contraseña por defecto en consultas de lectura
    attributes: { exclude: ['password'] }
  }
});

// Método de instancia para simular toJSON (eliminar password y limpiar ID)
User.prototype.toJSON = function () {
  const values = { ...this.get() };
  delete values.password;
  // Ajustamos el ID de Sequelize (id) al esperado en la app (_id)
  values._id = values._id || values.id;
  delete values.id; 
  return values;
};

export default User;
