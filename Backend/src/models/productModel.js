// Backend/src/models/productModel.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/sequelizeInstance.js';

const Product = sequelize.define('Product', {
  _id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'El nombre del producto no puede estar vacío'
      },
      len: {
        args: [3, 100],
        msg: 'El nombre debe tener entre 3 y 100 caracteres'
      }
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'La descripción no puede estar vacía'
      },
      len: {
        args: [10, 2000],
        msg: 'La descripción debe tener entre 10 y 2000 caracteres'
      }
    }
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      isDecimal: {
        msg: 'El precio debe ser un número decimal válido'
      },
      min: {
        args: [0.01],
        msg: 'El precio debe ser mayor a 0'
      }
    }
  },
  category: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'La categoría no puede estar vacía'
      },
      isIn: {
        args: [['Electrónica', 'Ropa', 'Hogar', 'Deportes', 'Libros', 'Juguetes', 'Alimentos', 'Otros']],
        msg: 'Categoría no válida'
      }
    }
  },
  stock: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      isInt: {
        msg: 'El stock debe ser un número entero'
      },
      min: {
        args: [0],
        msg: 'El stock no puede ser negativo'
      }
    }
  },
  image: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'https://via.placeholder.com/400x300?text=Producto',
    validate: {
      isUrl: {
        msg: 'La imagen debe ser una URL válida'
      }
    }
  },
  sellerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users', // Nombre de la tabla de usuarios
      key: '_id'
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  timestamps: true,
  indexes: [
    {
      fields: ['sellerId']
    },
    {
      fields: ['category']
    },
    {
      fields: ['isActive']
    }
  ]
});

// Método de instancia para formatear la respuesta
Product.prototype.toJSON = function () {
  const values = { ...this.get() };
  // Convertir 'id' de Sequelize a '_id' para consistencia con el frontend
  values._id = values._id || values.id;
  delete values.id;
  return values;
};

export default Product;
