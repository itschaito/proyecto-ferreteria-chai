// backend/src/models/CashRegisterClosure.js

import { DataTypes } from 'sequelize';

export default (sequelize) => {
    const CashRegisterClosure = sequelize.define('CashRegisterClosure', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    })
    return CashRegisterClosure;
};