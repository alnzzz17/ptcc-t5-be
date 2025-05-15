import sequelize from "./dbConnect.js";
import User from '../models/User.js';
import Note from '../models/Note.js';

// Relasi
User.hasMany(Note, { foreignKey: 'userId' });
Note.belongsTo(User, { foreignKey: 'userId' });

// Fungsi sinkronisasi database
const association = async () => {
  try {
    await sequelize.sync({ force: false });
    console.log('Database & tables synced!');
  } catch (error) {
    console.error('Failed to sync database:', error.message);
  }
};

export default association;