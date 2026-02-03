const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/connection');
const User = require('./User');
const Creche = require('./Creche');

const Avaliacao = sequelize.define('Avaliacao', {
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
  creche_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'creches',
      key: 'id'
    }
  },
  estrelas: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5
    }
  },
  comentario: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  recomenda: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  verificado: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'avaliacoes',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'creche_id']
    }
  ]
});

// Relacionamentos
Avaliacao.belongsTo(User, { foreignKey: 'user_id', as: 'usuario' });
Avaliacao.belongsTo(Creche, { foreignKey: 'creche_id', as: 'creche' });

User.hasMany(Avaliacao, { foreignKey: 'user_id', as: 'avaliacoes' });
Creche.hasMany(Avaliacao, { foreignKey: 'creche_id', as: 'avaliacoes' });

module.exports = Avaliacao;

