const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/connection');
const Creche = require('./Creche');

const FotoCreche = sequelize.define('FotoCreche', {
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
  imagem: {
    type: DataTypes.STRING(500),
    allowNull: false
  }
}, {
  tableName: 'fotos_creche',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

// Relacionamento: Uma foto pertence a uma creche
FotoCreche.belongsTo(Creche, { foreignKey: 'creche_id', as: 'creche' });
Creche.hasMany(FotoCreche, { foreignKey: 'creche_id', as: 'fotos' });

module.exports = FotoCreche;

