const express = require('express');
const router = express.Router();
const CrecheController = require('../controllers/CrecheController');
const { authenticate, isGestorOrAdmin } = require('../middlewares/authMiddleware');

/**
 * Rotas de creches
 */

// GET /creches - Listar todas as creches (público - sem auth)
router.get('/', CrecheController.index);

// GET /creches/:id - Obter detalhes de uma creche (público - sem auth)
router.get('/:id', CrecheController.show);

// POST /creches - Criar nova creche (requer ser gestor ou admin)
router.post('/', authenticate, isGestorOrAdmin, CrecheController.create);

// PUT /creches/:id - Atualizar creche
router.put('/:id', authenticate, CrecheController.update);

// DELETE /creches/:id - Deletar creche
router.delete('/:id', authenticate, CrecheController.delete);

// POST /creches/:id/fotos - Adicionar foto à creche
router.post('/:id/fotos', authenticate, CrecheController.addFoto);

// DELETE /creches/fotos/:fotoId - Remover foto da creche
router.delete('/fotos/:fotoId', authenticate, CrecheController.removeFoto);

module.exports = router;

