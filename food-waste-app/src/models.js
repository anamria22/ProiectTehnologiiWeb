const { Sequelize, DataTypes } = require('sequelize');

//initializam
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'FoodWasteApp.db'
});

// modele
const User = sequelize.define('User', {
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  phoneNumber: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: 'users',
  timestamps: false
});

const FridgeItem = sequelize.define('FridgeItem', {
  category: {
    type: DataTypes.STRING,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  date: {
    type: DataTypes.STRING,
    allowNull: false
  },
  about: {
    type: DataTypes.STRING,
    allowNull: false
  },
  shareable: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'fridgeItems',
  timestamps: false
});

const Friend = sequelize.define('Friend', {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  tag: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: 'friends',
  timestamps: false
});

const ShareList = sequelize.define('ShareList', {
  category: {
    type: DataTypes.STRING,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  date: {
    type: DataTypes.STRING,
    allowNull: false
  },
  about: {
    type: DataTypes.STRING,
    allowNull: false
  },
  shareable: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'shareList',
  timestamps: false
});

// def relatii
User.hasMany(FridgeItem, { foreignKey: 'idUser' });
FridgeItem.belongsTo(User, { foreignKey: 'idUser' });

User.hasMany(Friend, { foreignKey: 'idUser' });
Friend.belongsTo(User, { foreignKey: 'idUser' });

User.hasMany(ShareList, { foreignKey: 'idUser' });
ShareList.belongsTo(User, { foreignKey: 'idUser' });

module.exports = { sequelize, User, FridgeItem, Friend, ShareList };