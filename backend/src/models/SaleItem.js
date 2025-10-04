// backend/src/models/SaleItem.js

import { DataTypes } from 'sequelize';

export default (sequelize) => {
    const SaleItem = sequelize.define('SaleItem', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        saleId: { 
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        productId: { 
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                min: 1,
            },
        },
        unitPrice: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
    }, {
        indexes: [
            {
                unique: false,
                fields: ['saleId', 'productId']
            }
        ]
    });

    return SaleItem;
};