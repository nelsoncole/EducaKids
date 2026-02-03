const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/connection');
const User = require('./User');

const Crianca = sequelize.define('Crianca', {
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
  data_nascimento: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  genero: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  alergias: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  observacoes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'criancas',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Relacionamento: Uma criança pertence a um usuário (pai)
Crianca.belongsTo(User, { foreignKey: 'user_id', as: 'pai' });
User.hasMany(Crianca, { foreignKey: 'user_id', as: 'criancas' });

module.exports = Crianca;

