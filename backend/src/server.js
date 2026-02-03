/**
 * EDUCAKIDS - SERVIDOR PRINCIPAL
 * Backend API REST para o aplicativo EducaKids
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { testConnection, sequelize } = require('./database/connection');
const routes = require('./routes');

// Inicializar app
const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares globais
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.resolve(__dirname, '..', 'uploads')));

// Middleware de log de requisições
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Registrar rotas
app.use('/api', routes);

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error('Erro não tratado:', err);
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Erro interno do servidor',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// Função para iniciar o servidor
async function startServer() {
  try {
    console.log('🚀 Iniciando servidor EducaKids...\n');

    // Testar conexão com o banco de dados
    console.log('📊 Testando conexão com o banco de dados...');
    await testConnection();

    // Sincronizar models (opcional - usar migrations em produção)
    if (process.env.NODE_ENV === 'development') {
      console.log('🔄 Sincronizando models...');
      await sequelize.sync({ alter: false });
      console.log('✅ Models sincronizados.\n');
    }

    // Iniciar servidor
    app.listen(PORT, '0.0.0.0', () => {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`🎉 Servidor rodando em: http://localhost:${PORT}`);
      console.log(`📡 API disponível em: http://localhost:${PORT}/api`);
      console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
      console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      console.log('📚 Endpoints disponíveis:');
      console.log('   - POST   /api/auth/request-otp');
      console.log('   - POST   /api/auth/verify-otp');
      console.log('   - GET    /api/creches');
      console.log('   - POST   /api/creches');
      console.log('   - POST   /api/avaliacoes');
      console.log('   - POST   /api/matriculas');
      console.log('   - GET    /api/admin/stats');
      console.log('\n👉 Pressione CTRL+C para parar o servidor\n');
    });
  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
}

// Tratamento de erros não capturados
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Encerrando servidor...');
  
  try {
    await sequelize.close();
    console.log('✅ Conexão com banco de dados fechada.');
    console.log('👋 Servidor encerrado com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao encerrar:', error);
    process.exit(1);
  }
});

// Iniciar servidor
startServer();

module.exports = app;

