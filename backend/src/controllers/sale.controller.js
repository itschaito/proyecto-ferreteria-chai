// backend/src/controllers/sale.controller.js

import { db } from "../database/database.js"; 
// 🚨 NO DEBE HABER NINGUNA OTRA LÍNEA DE MODELOS AQUÍ 🚨

/**
 * Registra una nueva venta con múltiples productos.
 */
export const createSale = async (req, res) => {
    // 💡 CRÍTICO: Definición de modelos DENTRO de la función.
    const Sale = db.Sale;
    const SaleItem = db.SaleItem;
    const sequelize = db.sequelize; 
    const Product = db.Product; 

    const { clientName, total, items } = req.body;
    const userId = req.user ? req.user.id : null; 

    if (!userId) {
        return res.status(401).json({ message: "Usuario no autenticado para registrar la venta." });
    }
    if (!items || items.length === 0) {
        return res.status(400).json({ message: "La venta debe contener al menos un producto (item)." });
    }
    if (parseFloat(total) <= 0) {
        return res.status(400).json({ message: "El total de la venta debe ser mayor a cero." });
    }

    const transaction = await sequelize.transaction();

    try {
        // 1. Crear la cabecera de la venta (Sale)
        const newSale = await Sale.create({
            clientName,
            userId,
            total: parseFloat(total),
            date: new Date(),
        }, { transaction });

        const saleItemsData = [];
        
        // 2. Procesar y crear cada ítem de venta, actualizando el stock de productos
        for (const item of items) {
            const { productId, quantity, unitPrice } = item;
            
            // a. Buscar el producto y bloquearlo
            const product = await Product.findByPk(productId, { transaction, lock: transaction.LOCK.UPDATE });

            if (!product) {
                throw new Error(`Producto no encontrado en el inventario con ID: ${productId}.`);
            }

            const requestedQuantity = parseInt(quantity, 10);

            if (product.stock < requestedQuantity) {
                throw new Error(`Stock insuficiente para ${product.name}. Disponible: ${product.stock}.`);
            }

            // b. Deducir stock del producto
            product.stock -= requestedQuantity;
            await product.save({ transaction });

            // c. Preparar los datos del ítem de venta
            saleItemsData.push({ 
                saleId: newSale.id, 
                productId: product.id,
                quantity: requestedQuantity,
                unitPrice: parseFloat(unitPrice),
                subtotal: requestedQuantity * parseFloat(unitPrice),
            });
        }

        await SaleItem.bulkCreate(saleItemsData, { transaction });

        await transaction.commit();

        return res.status(201).json({ 
            message: 'Venta registrada con éxito.',
            sale: newSale
        });

    } catch (error) {
        await transaction.rollback();
        console.error('Error al crear la venta:', error);
        
        const message = error.message.includes('Stock insuficiente') || error.message.includes('Producto no encontrado') 
            ? error.message 
            : 'Error interno del servidor al registrar la venta.';
        return res.status(500).json({ message });
    }
};


/**
 * Lista todas las ventas o solo las del vendedor logueado.
 */
export const getSales = async (req, res) => {
    // 💡 CRÍTICO: Definición de modelos DENTRO de la función.
    const Sale = db.Sale;
    const User = db.User;
    const SaleItem = db.SaleItem;
    const Product = db.Product;
    
    const userRole = req.user.role;
    const userId = req.user.id;

    let whereClause = {};
    if (userRole !== 'Administrador') {
        whereClause = { userId: userId };
    }

    try {
        // 🚨 La llamada a Sale.findAll() ahora está protegida por las declaraciones locales.
        const sales = await Sale.findAll({
            where: whereClause,
            include: [
                {
                    model: User,
                    as: 'seller', // Alias de Sale -> User
                    attributes: ['id', 'email', 'role']
                },
                {
                    model: SaleItem,
                    as: 'items', // Alias de Sale -> SaleItem
                    include: [{
                        model: Product,
                        as: 'product', // Alias de SaleItem -> Product (Solución del error anterior)
                        attributes: ['id', 'name', 'price']
                    }]
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        return res.status(200).json(sales);
    } catch (error) {
        console.error('Error al obtener ventas:', error);
        return res.status(500).json({ message: 'Error interno del servidor al obtener ventas.' });
    }
};

/**
 * Funciones de CRUD faltantes (stubs para evitar errores de importación en las rutas)
 */
export const getSaleById = (req, res) => {
    return res.status(501).json({ message: "Función getSaleById aún no implementada." });
};

export const updateSale = (req, res) => {
    return res.status(501).json({ message: "Función updateSale aún no implementada." });
};

export const deleteSale = (req, res) => {
    return res.status(501).json({ message: "Función deleteSale aún no implementada." });
};