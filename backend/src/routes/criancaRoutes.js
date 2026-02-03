const express = require('express');
const router = express.Router();
const CriancaController = require('../controllers/CriancaController');
const { authenticate, isPaiOrAdmin } = require('../middlewares/authMiddleware');

/**
 * Rotas de crianças
 * Todas requerem autenticação
 */

// GET /criancas - Listar crianças do usuário
router.get('/', authenticate, CriancaController.index);

// GET /criancas/:id - Obter detalhes de uma criança
router.get('/:id', authenticate, CriancaController.show);

// POST /criancas - Cadastrar nova criança
router.post('/', authenticate, isPaiOrAdmin, CriancaController.create);

// PUT /criancas/:id - Atualizar dados da criança
router.put('/:id', authenticate, CriancaController.update);

// DELETE /criancas/:id - Deletar criança
router.delete('/:id', authenticate, CriancaController.delete);

module.exports = router;

