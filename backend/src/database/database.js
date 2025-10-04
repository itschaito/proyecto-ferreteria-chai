// backend/src/database/database.js

import { Sequelize } from "sequelize";
import defineUserModel from "../models/User.js";
import defineProductModel from "../models/Product.js";
import defineSaleModel from "../models/Sale.js";
import defineSaleItemModel from "../models/SaleItem.js";
// 💡 CRÍTICO: Importación faltante
import defineCashRegisterClosureModel from "../models/CashRegisterClosure.js"; 
import { setupAssociations } from "../models/relations.js";

export const db = {}; // Usa este objeto vacío para evitar el error de dependencia circular

// 1. Definir la instancia de Sequelize con los datos de MariaDB
const sequelize = new Sequelize("dbFranco", "usrDev", "pa$$word.-", {
  dialect: "mysql",
  host: "mcu.calhasdfv17y.us-east-1.rds.amazonaws.com",
  logging: false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

// 2. Inyectar la instancia de Sequelize en las funciones de modelo
db.User = defineUserModel(sequelize);
db.Product = defineProductModel(sequelize);
db.Sale = defineSaleModel(sequelize);
db.SaleItem = defineSaleItemModel(sequelize);
// 💡 CRÍTICO: Definición faltante
db.CashRegisterClosure = defineCashRegisterClosureModel(sequelize); 

// 3. Hola la instancia de Sequelize
db.sequelize = sequelize;
db.Sequelize = Sequelize;

export async function connectToDatabase() {
  try {
    await db.sequelize.authenticate();
    console.log("Conexión a la base de datos establecida para reset.");

    // 💡 REACTIVAR las claves foráneas
    await db.sequelize.query("SET FOREIGN_KEY_CHECKS = 1;");

    // 🔹 Volver a crear tablas desde los modelos
    setupAssociations(db);

    await db.sequelize.sync({ alter: true });
    console.log("Todas las tablas recreadas desde cero.");

  } catch (error) {
    console.error("Error al resetear la base de datos:", error);
    throw error;
  }
}
