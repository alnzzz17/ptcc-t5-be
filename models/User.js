import { Sequelize } from 'sequelize';
import sequelize from "../utils/dbConnect.js";

const User = sequelize.define('user', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true
    },
    username: {
        type: Sequelize.STRING,
        allowNull: false
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false
    },
    fullName: {
        type: Sequelize.STRING,
        allowNull: false
    },
    refreshToken: {
        type: Sequelize.TEXT,
        allowNull: true
    }
}, {
    timestamps: true
});

export default User;