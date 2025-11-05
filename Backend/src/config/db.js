// Backend/src/config/db.js
import sequelize from './sequelizeInstance.js';

// Importamos TODOS los modelos de Sequelize
import User from '../models/userModel.js';
import Product from '../models/productModel.js';
// Importamos los nuevos modelos migrados
import Conversation from '../models/conversationModel.js';
import Message from '../models/messageModel.js';

// ========================================
// DEFINIR ASOCIACIONES ENTRE MODELOS
// ========================================

// --- Producto y Vendedor (User) ---
User.hasMany(Product, {
  foreignKey: 'sellerId',
  as: 'products',
  onDelete: 'CASCADE'
});
Product.belongsTo(User, {
  foreignKey: 'sellerId',
  as: 'seller'
});

// --- Conversaciones y Participantes (User) ---
// Una conversación tiene muchos participantes (usuarios)
// Un usuario puede estar en muchas conversaciones
// Esto crea una tabla intermedia (Junction Table) llamada 'ConversationParticipants'
User.belongsToMany(Conversation, {
  through: 'ConversationParticipants',
  foreignKey: 'userId',
  as: 'conversations'
});
Conversation.belongsToMany(User, {
  through: 'ConversationParticipants',
  foreignKey: 'conversationId',
  as: 'participants'
});

// --- Mensajes (Sender y Conversation) ---
// Un mensaje pertenece a un remitente (User)
Message.belongsTo(User, {
  foreignKey: 'senderId',
  as: 'sender'
});
User.hasMany(Message, {
  foreignKey: 'senderId',
  as: 'sentMessages'
});

// Un mensaje pertenece a una conversación
Message.belongsTo(Conversation, {
  foreignKey: 'conversationId',
  onDelete: 'CASCADE' // Si se borra la conversación, se borran los mensajes
});
Conversation.hasMany(Message, {
  foreignKey: 'conversationId',
  as: 'messages'
});

// --- Conversación y Producto ---
// Una conversación puede estar relacionada con un producto
Conversation.belongsTo(Product, {
  foreignKey: 'productId',
  as: 'product',
  onDelete: 'SET NULL', // Si el producto se borra, la conversación no
  allowNull: true
});
Product.hasMany(Conversation, {
  foreignKey: 'productId'
});

// --- Conversación y Último Mensaje ---
// Una conversación tiene un último mensaje
Conversation.belongsTo(Message, {
  foreignKey: 'lastMessageId',
  as: 'lastMessage',
  onDelete: 'SET NULL', // Si el mensaje se borra, no se borra la conversación
  allowNull: true
});

// ========================================
// FUNCIÓN DE CONEXIÓN
// ========================================

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ SQLite Connection has been established successfully.');
    
    // Sincronizar modelos
    // alter: true -> Actualiza las tablas si hay cambios en los modelos (¡Útil en desarrollo!)
    await sequelize.sync({ force: false, alter: true });
    console.log('✅ All models were synchronized successfully.');

  } catch (error) {
    console.error(`❌ Unable to connect to the database: ${error.message}`);
    process.exit(1);
  }
};

// Exportamos sequelize y todos los modelos
export { connectDB, sequelize, User, Product, Conversation, Message };