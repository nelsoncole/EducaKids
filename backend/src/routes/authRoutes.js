const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthController');
const { authenticate } = require('../middlewares/authMiddleware');

/**
 * Rotas de autenticação
 */

// POST /auth/login - Fazer login
router.post('/login', AuthController.login);

// POST /auth/register - Registar novo usuário
router.post('/register', AuthController.register);

// POST /auth/logout - Fazer logout
router.post('/logout', authenticate, AuthController.logout);

// GET /auth/me - Obter usuário autenticado
router.get('/me', authenticate, AuthController.getMe);

module.exports = router;
