import { Sequelize } from "sequelize";
import sequelize from "../utils/dbConnect.js";
import User from "./User.js";

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
}, {
    timestamps: true
});

export default Note;