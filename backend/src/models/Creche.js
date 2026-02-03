const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/connection');
const User = require('./User');

const Creche = sequelize.define('Creche', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  nome: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  endereco: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  mensalidade: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  horario: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  descricao: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'creches',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Relacionamento: Uma creche pertence a um usuário (gestor)
Creche.belongsTo(User, { foreignKey: 'user_id', as: 'gestor' });
User.hasMany(Creche, { foreignKey: 'user_id', as: 'creches' });

module.exports = Creche;

