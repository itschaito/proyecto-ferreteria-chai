// backend/src/models/relations.js

/**
 * Configura las asociaciones entre todos los modelos.
 * Se utilizan SaleItem para las relaciones muchos a muchos entre Venta y Producto.
 * @param {object} db - El contenedor de modelos (db.User, db.Product, db.Sale, db.SaleItem, db.CashRegisterClosure).
 */
export const setupAssociations = (db) => {
    // 💡 IMPORTANTE: Asegúrate de que CashRegisterClosure esté incluido en db (verificar database.js)
    const { User, Product, Sale, SaleItem, CashRegisterClosure } = db; 
    
    // 1. Relaciones de Usuario (Vendedor) con Venta (Sale)
    // Un Usuario (Vendedor) puede tener muchas Ventas
    User.hasMany(Sale, { foreignKey: 'userId', as: 'sales' });
    // Una Venta pertenece a un Usuario (Vendedor)
    Sale.belongsTo(User, { foreignKey: 'userId', as: 'seller' });

    
    // 2. Relaciones de Venta (Sale) con Ítem de Venta (SaleItem)
    // Una Venta tiene muchos ítems (SaleItem)
    Sale.hasMany(SaleItem, {
        foreignKey: 'saleId',
        as: 'items', 
        onDelete: 'CASCADE', // Si se elimina la venta, se eliminan sus ítems
    });
    // Un Ítem de Venta pertenece a una Venta
    SaleItem.belongsTo(Sale, { foreignKey: 'saleId' });


    // 3. Relaciones de Producto con Ítem de Venta (SaleItem)
    // Un Producto puede tener muchos ítems de venta
    Product.hasMany(SaleItem, { foreignKey: 'productId', as: 'saleItems' });
    // Un Ítem de Venta pertenece a un Producto
    SaleItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

    
    // 4. Relaciones de Usuario (Administrador) con Cierre de Caja (CashRegisterClosure)
    // 🛑 COMENTADO: La clave foránea se define explícitamente en el modelo CashRegisterClosure.js
    User.hasMany(CashRegisterClosure, { foreignKey: 'userId', as: 'closures' });
    CashRegisterClosure.belongsTo(User, { foreignKey: 'userId', as: 'closedBy' });

    console.log("Relaciones de Sequelize configuradas exitosamente, excluyendo Cierre de Caja (definida en el modelo).");
};