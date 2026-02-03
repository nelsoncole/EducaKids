const express = require('express');
const router = express.Router();
const AvaliacaoController = require('../controllers/AvaliacaoController');
const { authenticate } = require('../middlewares/authMiddleware');

/**
 * Rotas de avaliações
 */

// GET /avaliacoes/creche/:creche_id - Listar avaliações de uma creche (público)
router.get('/creche/:creche_id', AvaliacaoController.indexByCreche);

// GET /avaliacoes/creche/:creche_id/stats - Obter estatísticas de avaliações (público)
router.get('/creche/:creche_id/stats', AvaliacaoController.getStats);

// POST /avaliacoes - Criar avaliação (requer autenticação)
router.post('/', authenticate, AvaliacaoController.create);

// PUT /avaliacoes/:id - Atualizar avaliação
router.put('/:id', authenticate, AvaliacaoController.update);

// DELETE /avaliacoes/:id - Deletar avaliação
router.delete('/:id', authenticate, AvaliacaoController.delete);

module.exports = router;

