import { DataTypes } from 'sequelize';

export default (sequelize) => {
    const Sale = sequelize.define('Sale', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        userId: { 
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        clientName: { 
            type: DataTypes.STRING,
            allowNull: true,
        },
        // Columnas productId y quantity eliminadas, ahora están en SaleItem
        
        total: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        date: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        }
    });
    return Sale;
};