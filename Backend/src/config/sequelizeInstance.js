// Backend /src/config/sequelizeInstance.js (NUEVO ARCHIVO)
import { Sequelize } from 'sequelize';

// 1. Configurar Sequelize para usar SQLite y definir la instancia PRIMERO
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite', // El archivo donde se guardará la base de datos
  logging: false, 
});

export default sequelize;