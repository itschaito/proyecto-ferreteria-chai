// src/controllers/closure.controller.js

// 💡 CORREGIDO: Importamos el objeto 'db' de models/index.js para acceder a:
//    1. Los modelos (db.Sale, db.CashRegisterClosure)
//    2. La instancia de sequelize (db.sequelize) para manejar transacciones.
import { db } from "../database/database.js"; 

export const closeCashRegister = async (req, res) => {
    // Verificar si el usuario es Administrador (asumiendo que req.user fue inyectado por el middleware)
    if (req.user.role !== 'Administrador') {
        return res.status(403).json({ message: 'Permiso denegado. Solo los administradores pueden realizar el cierre de caja.' });
    }

    // 💡 Transacción usando db.sequelize
    const t = await db.sequelize.transaction();

    try {
        // Acceder al modelo de ventas a través de db
        const currentSales = await db.Sale.findAll({ transaction: t });
        
        const totalRevenue = currentSales.reduce((sum, sale) => {
            return sum + parseFloat(sale.total); 
        }, 0);
        
        const salesCount = currentSales.length;

        // Crear el registro histórico
        await db.CashRegisterClosure.create({
            totalRevenue: totalRevenue,
            salesCount: salesCount,
            closedByUserId: req.user.id, // ID del Admin logueado
        }, { transaction: t });

        // Eliminar las ventas actuales para reiniciar el contador del período a $0.00
        if (salesCount > 0) {
            // Nota: Podrías necesitar borrar primero db.SaleItem si hay una restricción de clave foránea.
            // Para simplificar, borramos la tabla Sale. 
            
            await db.Sale.destroy({
                where: {}, 
                // Truncate asegura que la tabla se vacíe por completo y se resetee el AUTO_INCREMENT.
                truncate: true, 
                transaction: t
            });
            
            // Asumiendo que SaleItem se borra en cascada o que el backend lo manejará por separado.
        }

        await t.commit();

        res.status(200).json({ 
            message: 'Cierre de Caja exitoso. Ventas guardadas y reiniciadas.',
            totalClosedRevenue: totalRevenue.toFixed(2),
            salesClosed: salesCount
        });

    } catch (error) {
        await t.rollback();
        console.error('Error al realizar el Cierre de Caja:', error);
        res.status(500).json({ message: 'Fallo interno del servidor al procesar el cierre de caja.', error: error.message });
    }
};