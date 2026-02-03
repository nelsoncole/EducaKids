const express = require('express');
const router = express.Router();

// Importar rotas
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const crecheRoutes = require('./crecheRoutes');
const criancaRoutes = require('./criancaRoutes');
const matriculaRoutes = require('./matriculaRoutes');
const avaliacaoRoutes = require('./avaliacaoRoutes');
const adminRoutes = require('./adminRoutes');
const uploadRoutes = require('./uploadRoutes');

/**
 * Registrar todas as rotas
 */

// Rota de teste
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'EducaKids API - Bem-vindo!',
    version: '1.0.0',
    endpoints: {
      auth: '/auth',
      users: '/users',
      creches: '/creches',
      criancas: '/criancas',
      matriculas: '/matriculas',
      avaliacoes: '/avaliacoes',
      admin: '/admin'
    }
  });
});

// Rota de health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'OK',
    timestamp: new Date().toISOString()
  });
});

// Registrar rotas
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/creches', crecheRoutes);
router.use('/criancas', criancaRoutes);
router.use('/matriculas', matriculaRoutes);
router.use('/avaliacoes', avaliacaoRoutes);
router.use('/admin', adminRoutes);
router.use('/upload', uploadRoutes);

// Rota 404
router.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Rota não encontrada'
  });
});

module.exports = router;

