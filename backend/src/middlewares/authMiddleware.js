const authService = require('../services/authService');
const { User } = require('../models');

/**
 * Middleware de autenticação
 * Verifica se o token JWT é válido
 */
async function authenticate(req, res, next) {
  try {
    // Obter token do header Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Token não fornecido'
      });
    }

    // Formato esperado: Bearer TOKEN
    const parts = authHeader.split(' ');
    
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({
        success: false,
        message: 'Formato de token inválido'
      });
    }

    const token = parts[1];

    // Verificar token
    const decoded = authService.verifyToken(token);

    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Token inválido ou expirado'
      });
    }

    // Buscar usuário
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    // Adicionar dados do usuário ao request
    req.user = {
      id: user.id,
      nome: user.nome,
      telefone: user.telefone,
      email: user.email,
      tipo: user.tipo
    };

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erro na autenticação',
      error: error.message
    });
  }
}

/**
 * Middleware de permissão por tipo de usuário
 */
function authorize(...allowedTypes) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Não autenticado'
      });
    }

    if (!allowedTypes.includes(req.user.tipo)) {
      return res.status(403).json({
        success: false,
        message: 'Sem permissão para acessar este recurso'
      });
    }

    next();
  };
}

/**
 * Middleware específico para pais (Pai ou Mãe)
 */
function isPai(req, res, next) {
  return authorize('pai', 'mae')(req, res, next);
}

/**
 * Middleware específico para gestores
 */
function isGestor(req, res, next) {
  return authorize('gestor')(req, res, next);
}

/**
 * Middleware específico para admins
 */
function isAdmin(req, res, next) {
  return authorize('admin')(req, res, next);
}

/**
 * Middleware que permite pai, mãe ou admin
 */
function isPaiOrAdmin(req, res, next) {
  return authorize('pai', 'mae', 'admin')(req, res, next);
}

/**
 * Middleware que permite gestor ou admin
 */
function isGestorOrAdmin(req, res, next) {
  return authorize('gestor', 'admin')(req, res, next);
}

module.exports = {
  authenticate,
  authorize,
  isPai,
  isGestor,
  isAdmin,
  isPaiOrAdmin,
  isGestorOrAdmin
};

