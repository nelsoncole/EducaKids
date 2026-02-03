const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/connection');
const Creche = require('./Creche');
const Crianca = require('./Crianca');
const User = require('./User');

const Matricula = sequelize.define('Matricula', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  creche_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'creches',
      key: 'id'
    }
  },
  crianca_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'criancas',
      key: 'id'
    }
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM('pendente', 'aceite', 'rejeitado'),
    allowNull: false,
    defaultValue: 'pendente'
  }
}, {
  tableName: 'matriculas',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Relacionamentos
Matricula.belongsTo(Creche, { foreignKey: 'creche_id', as: 'creche' });
Matricula.belongsTo(Crianca, { foreignKey: 'crianca_id', as: 'crianca' });
Matricula.belongsTo(User, { foreignKey: 'user_id', as: 'pai' });

Creche.hasMany(Matricula, { foreignKey: 'creche_id', as: 'matriculas' });
Crianca.hasMany(Matricula, { foreignKey: 'crianca_id', as: 'matriculas' });
User.hasMany(Matricula, { foreignKey: 'user_id', as: 'matriculas' });

module.exports = Matricula;

