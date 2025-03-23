const sequelize = require("../utils/dbConnect");
const Sequelize = require("sequelize");
const User = require("./User");

const Note = sequelize.define('note', {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true,
        },
        userId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: User,
                key: "id",
            },
            onDelete: "CASCADE",
        },
        noteTitle: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        noteContent: {
            type: Sequelize.TEXT,
            allowNull: true,
        }
    },
    {
        timestamps: true
    }
);

module.exports = Note;