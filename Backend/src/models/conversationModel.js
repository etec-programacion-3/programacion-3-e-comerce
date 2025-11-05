// Backend/src/models/conversationModel.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/sequelizeInstance.js';

const Conversation = sequelize.define('Conversation', {
  _id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  // La asociación 'productId' se definirá en db.js
  // La asociación 'lastMessageId' se definirá en db.js
}, {
  timestamps: true,
  indexes: [
    {
      fields: ['productId']
    },
    {
      fields: ['lastMessageId']
    }
  ]
});

// Método de instancia para formatear la respuesta
Conversation.prototype.toJSON = function () {
  const values = { ...this.get() };
  values._id = values._id || values.id;
  delete values.id;
  return values;
};

// LÍNEA QUE FALTABA:
export default Conversation;