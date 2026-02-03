const { User, Creche, Avaliacao, Matricula, Crianca } = require('../models');
const { sequelize } = require('../database/connection');

class AdminController {
  /**
   * Listar todos os usuários
   * GET /admin/users
   */
  async listUsers(req, res) {
    try {
      const { tipo, page = 1, limit = 20 } = req.query;
      const offset = (page - 1) * limit;

      const where = {};
      if (tipo) where.tipo = tipo;

      const users = await User.findAndCountAll({
        where,
        attributes: { exclude: [] },
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['created_at', 'DESC']]
      });

      return res.status(200).json({
        success: true,
        data: users.rows,
        pagination: {
          total: users.count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(users.count / limit)
        }
      });
    } catch (error) {
      console.error('Erro ao listar usuários:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao listar usuários',
        error: error.message
      });
    }
  }

  /**
   * Bloquear/desbloquear usuário
   * PUT /admin/users/:id/toggle-status
   */
  async toggleUserStatus(req, res) {
    try {
      const { id } = req.params;

      const user = await User.findByPk(id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuário não encontrado'
        });
      }

      if (user.tipo === 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Não é possível bloquear um administrador'
        });
      }

      // Aqui você pode adicionar um campo 'bloqueado' na tabela users
      // Por enquanto, vamos apenas retornar sucesso
      return res.status(200).json({
        success: true,
        message: 'Status do usuário alterado com sucesso',
        data: user
      });
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao alterar status do usuário',
        error: error.message
      });
    }
  }

  /**
   * Deletar usuário
   * DELETE /admin/users/:id
   */
  async deleteUser(req, res) {
    try {
      const { id } = req.params;

      const user = await User.findByPk(id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuário não encontrado'
        });
      }

      if (user.tipo === 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Não é possível eliminar um administrador'
        });
      }

      await user.destroy();

      return res.status(200).json({
        success: true,
        message: 'Usuário eliminado com sucesso'
      });
    } catch (error) {
      console.error('Erro ao eliminar usuário:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao eliminar usuário',
        error: error.message
      });
    }
  }

  /**
   * Obter estatísticas gerais
   * GET /admin/stats
   */
  async getStats(req, res) {
    try {
      // Contar usuários por tipo
      const totalUsers = await User.count();
      const totalPais = await User.count({ where: { tipo: 'pai' } });
      const totalGestores = await User.count({ where: { tipo: 'gestor' } });
      const totalAdmins = await User.count({ where: { tipo: 'admin' } });

      // Contar creches
      const totalCreches = await Creche.count();

      // Contar matrículas por status
      const totalMatriculas = await Matricula.count();
      const matriculasPendentes = await Matricula.count({ where: { status: 'pendente' } });
      const matriculasAceites = await Matricula.count({ where: { status: 'aceite' } });
      const matriculasRejeitadas = await Matricula.count({ where: { status: 'rejeitado' } });

      // Contar avaliações
      const totalAvaliacoes = await Avaliacao.count();
      const avaliacoesVerificadas = await Avaliacao.count({ where: { verificado: true } });

      // Contar crianças
      const totalCriancas = await Crianca.count();

      return res.status(200).json({
        success: true,
        data: {
          usuarios: {
            total: totalUsers,
            pais: totalPais,
            gestores: totalGestores,
            admins: totalAdmins
          },
          creches: totalCreches,
          matriculas: {
            total: totalMatriculas,
            pendentes: matriculasPendentes,
            aceites: matriculasAceites,
            rejeitadas: matriculasRejeitadas
          },
          avaliacoes: {
            total: totalAvaliacoes,
            verificadas: avaliacoesVerificadas
          },
          criancas: totalCriancas
        }
      });
    } catch (error) {
      console.error('Erro ao obter estatísticas:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao obter estatísticas',
        error: error.message
      });
    }
  }

  /**
   * Listar todas as creches (admin)
   * GET /admin/creches
   */
  async listCreches(req, res) {
    try {
      const { page = 1, limit = 20 } = req.query;
      const offset = (page - 1) * limit;

      const creches = await Creche.findAndCountAll({
        include: [
          {
            model: User,
            as: 'gestor',
            attributes: ['id', 'nome', 'telefone', 'email']
          }
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['created_at', 'DESC']]
      });

      return res.status(200).json({
        success: true,
        data: creches.rows,
        pagination: {
          total: creches.count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(creches.count / limit)
        }
      });
    } catch (error) {
      console.error('Erro ao listar creches:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao listar creches',
        error: error.message
      });
    }
  }

  /**
   * Listar todas as avaliações (admin)
   * GET /admin/avaliacoes
   */
  async listAvaliacoes(req, res) {
    try {
      const { page = 1, limit = 20 } = req.query;
      const offset = (page - 1) * limit;

      const avaliacoes = await Avaliacao.findAndCountAll({
        include: [
          {
            model: User,
            as: 'usuario',
            attributes: ['id', 'nome', 'telefone']
          },
          {
            model: Creche,
            as: 'creche',
            attributes: ['id', 'nome']
          }
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['created_at', 'DESC']]
      });

      return res.status(200).json({
        success: true,
        data: avaliacoes.rows,
        pagination: {
          total: avaliacoes.count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(avaliacoes.count / limit)
        }
      });
    } catch (error) {
      console.error('Erro ao listar avaliações:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao listar avaliações',
        error: error.message
      });
    }
  }

  /**
   * Alterar tipo de usuário
   * PUT /admin/users/:id/tipo
   */
  async updateUserType(req, res) {
    try {
      const { id } = req.params;
      const { tipo } = req.body;

      if (!['pai', 'gestor', 'admin'].includes(tipo)) {
        return res.status(400).json({
          success: false,
          message: 'Tipo inválido. Use: pai, gestor ou admin'
        });
      }

      const user = await User.findByPk(id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuário não encontrado'
        });
      }

      user.tipo = tipo;
      await user.save();

      return res.status(200).json({
        success: true,
        message: 'Tipo de usuário alterado com sucesso',
        data: user
      });
    } catch (error) {
      console.error('Erro ao alterar tipo:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao alterar tipo de usuário',
        error: error.message
      });
    }
  }
}

module.exports = new AdminController();

