const sequelize = require("./dbConnect");
const User = require('../models/User');
const Note = require('../models/Note');

User.hasMany(Note, { foreignKey: 'userId'});
Note.belongsTo(User, { foreignKey: 'userId'});

const association = async()=>{
  try {
    await sequelize.sync({force: false});
  } catch (error) {
    console.log(error.message);
  }
}

module.exports = association; 
