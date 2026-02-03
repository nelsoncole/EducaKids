const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController');
const { authenticate } = require('../middlewares/authMiddleware');

/**
 * Rotas de usuário
 * Todas requerem autenticação
 */

// GET /users/profile - Obter perfil do usuário
router.get('/profile', authenticate, UserController.getProfile);

// PUT /users/profile - Atualizar perfil do usuário
router.put('/profile', authenticate, UserController.updateProfile);

// DELETE /users/account - Deletar conta do usuário
router.delete('/account', authenticate, UserController.deleteAccount);

// POST /users/become-gestor - Alterar tipo para gestor
router.post('/become-gestor', authenticate, UserController.becomeGestor);

module.exports = router;

