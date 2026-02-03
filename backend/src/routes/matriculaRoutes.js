const express = require('express');
const router = express.Router();
const MatriculaController = require('../controllers/MatriculaController');
const { authenticate, isGestorOrAdmin } = require('../middlewares/authMiddleware');

/**
 * Rotas de matrículas
 * Todas requerem autenticação
 */

// GET /matriculas - Listar matrículas do usuário (pai)
router.get('/', authenticate, MatriculaController.index);

// GET /matriculas/creche/:creche_id - Listar matrículas de uma creche (gestor)
router.get('/creche/:creche_id', authenticate, isGestorOrAdmin, MatriculaController.indexByCreche);

// POST /matriculas - Criar nova matrícula
router.post('/', authenticate, MatriculaController.create);

// PUT /matriculas/:id/status - Atualizar status da matrícula (gestor aceita/rejeita)
router.put('/:id/status', authenticate, isGestorOrAdmin, MatriculaController.updateStatus);

// DELETE /matriculas/:id - Cancelar matrícula
router.delete('/:id', authenticate, MatriculaController.delete);

module.exports = router;

