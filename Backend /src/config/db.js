// Backend/src/config/db.js
import sequelize from './sequelizeInstance.js';

// Importamos los modelos AQUÍ para que Sequelize los registre y sincronice
import User from '../models/userModel.js'; 
import Product from '../models/productModel.js';
import Conversation from '../models/conversationModel.js';
import Message from '../models/messageModel.js';

// ========================================
// DEFINIR ASOCIACIONES ENTRE MODELOS
// ========================================

// Un Usuario (vendedor) puede tener muchos Productos
User.hasMany(Product, {
  foreignKey: 'sellerId',
  as: 'products',
  onDelete: 'CASCADE'
});

// Un Producto pertenece a un Usuario (vendedor)
Product.belongsTo(User, {
  foreignKey: 'sellerId',
  as: 'seller'
});

// TODO: Definir asociaciones para Conversation y Message cuando sean necesarias
// Ejemplo:
// User.belongsToMany(Conversation, { through: 'ConversationParticipants', foreignKey: 'userId' });
// Conversation.belongsToMany(User, { through: 'ConversationParticipants', foreignKey: 'conversationId' });
// Message.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });
// Message.belongsTo(Conversation, { foreignKey: 'conversationId' });

const connectDB = async () => {
  try {
    // Autenticar la conexión (esto crea el archivo .sqlite si no existe)
    await sequelize.authenticate();
    console.log('✅ SQLite Connection has been established successfully.');
    
    // Sincronizar modelos: Crea las tablas si no existen
    // { force: false } previene la eliminación de tablas existentes
    // { alter: true } actualiza las tablas si la estructura cambió
    await sequelize.sync({ force: false, alter: false }); 
    console.log('✅ All models were synchronized successfully.');

  } catch (error) {
    console.error(`❌ Unable to connect to the database: ${error.message}`);
    process.exit(1);
  }
};

// Exportamos sequelize y todos los modelos
export { connectDB, sequelize, User, Product, Conversation, Message };
