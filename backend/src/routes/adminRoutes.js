const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/AdminController');
const { authenticate, isAdmin } = require('../middlewares/authMiddleware');

/**
 * Rotas administrativas
 * Todas requerem autenticação como admin
 */

// GET /admin/users - Listar todos os usuários
router.get('/users', authenticate, isAdmin, AdminController.listUsers);

// PUT /admin/users/:id/toggle-status - Bloquear/desbloquear usuário
router.put('/users/:id/toggle-status', authenticate, isAdmin, AdminController.toggleUserStatus);

// DELETE /admin/users/:id - Deletar usuário
router.delete('/users/:id', authenticate, isAdmin, AdminController.deleteUser);

// PUT /admin/users/:id/tipo - Alterar tipo de usuário
router.put('/users/:id/tipo', authenticate, isAdmin, AdminController.updateUserType);

// GET /admin/stats - Obter estatísticas gerais
router.get('/stats', authenticate, isAdmin, AdminController.getStats);

// GET /admin/creches - Listar todas as creches
router.get('/creches', authenticate, isAdmin, AdminController.listCreches);

// GET /admin/avaliacoes - Listar todas as avaliações
router.get('/avaliacoes', authenticate, isAdmin, AdminController.listAvaliacoes);

module.exports = router;

