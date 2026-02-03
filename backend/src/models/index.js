// Arquivo centralizador dos models
// Este arquivo importa todos os models e exporta para uso em outras partes da aplicação

const { sequelize } = require('../database/connection');

// Importar models
const User = require('./User');
const Creche = require('./Creche');
const FotoCreche = require('./FotoCreche');
const Crianca = require('./Crianca');
const Matricula = require('./Matricula');
const Avaliacao = require('./Avaliacao');

// Sincronizar models com o banco de dados
async function syncDatabase() {
  try {
    await sequelize.sync({ alter: false });
    console.log('✅ Models sincronizados com a base de dados.');
  } catch (error) {
    console.error('❌ Erro ao sincronizar models:', error);
  }
}

module.exports = {
  sequelize,
  syncDatabase,
  User,
  Creche,
  FotoCreche,
  Crianca,
  Matricula,
  Avaliacao
};

