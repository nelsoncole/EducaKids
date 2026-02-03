const { Matricula, Crianca, Creche, User } = require('../models');

class MatriculaController {
  /**
   * Listar matrículas do usuário (pai)
   * GET /matriculas
   */
  async index(req, res) {
    try {
      const matriculas = await Matricula.findAll({
        where: { user_id: req.user.id },
        include: [
          {
            model: Crianca,
            as: 'crianca'
          },
          {
            model: Creche,
            as: 'creche',
            include: [
              {
                model: User,
                as: 'gestor',
                attributes: ['id', 'nome', 'telefone']
              }
            ]
          }
        ],
        order: [['created_at', 'DESC']]
      });

      return res.status(200).json({
        success: true,
        data: matriculas
      });
    } catch (error) {
      console.error('Erro ao listar matrículas:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao listar matrículas',
        error: error.message
      });
    }
  }

  /**
   * Listar matrículas de uma creche (gestor)
   * GET /matriculas/creche/:creche_id
   */
  async indexByCreche(req, res) {
    try {
      const { creche_id } = req.params;

      // Verificar se a creche pertence ao gestor
      const creche = await Creche.findOne({
        where: { 
          id: creche_id,
          user_id: req.user.id 
        }
      });

      if (!creche && req.user.tipo !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Sem permissão para ver matrículas desta creche'
        });
      }

      const matriculas = await Matricula.findAll({
        where: { creche_id },
        include: [
          {
            model: Crianca,
            as: 'crianca'
          },
          {
            model: User,
            as: 'pai',
            attributes: ['id', 'nome', 'telefone', 'email']
          }
        ],
        order: [['created_at', 'DESC']]
      });

      return res.status(200).json({
        success: true,
        data: matriculas
      });
    } catch (error) {
      console.error('Erro ao listar matrículas da creche:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao listar matrículas da creche',
        error: error.message
      });
    }
  }

  /**
   * Criar nova matrícula
   * POST /matriculas
   */
  async create(req, res) {
    try {
      const { creche_id, crianca_id } = req.body;

      // Validações
      if (!creche_id || !crianca_id) {
        return res.status(400).json({
          success: false,
          message: 'Creche e criança são obrigatórios'
        });
      }

      // Verificar se a criança pertence ao usuário
      const crianca = await Crianca.findOne({
        where: { 
          id: crianca_id,
          user_id: req.user.id 
        }
      });

      if (!crianca) {
        return res.status(404).json({
          success: false,
          message: 'Criança não encontrada'
        });
      }

      // Verificar se a creche existe
      const creche = await Creche.findByPk(creche_id);

      if (!creche) {
        return res.status(404).json({
          success: false,
          message: 'Creche não encontrada'
        });
      }

      // Verificar se já existe matrícula ativa
      const matriculaExistente = await Matricula.findOne({
        where: {
          crianca_id,
          creche_id,
          status: 'aceite'
        }
      });

      if (matriculaExistente) {
        return res.status(400).json({
          success: false,
          message: 'Esta criança já possui matrícula ativa nesta creche'
        });
      }

      // Criar matrícula
      const matricula = await Matricula.create({
        creche_id,
        crianca_id,
        user_id: req.user.id,
        status: 'pendente'
      });

      // Recarregar com relacionamentos
      await matricula.reload({
        include: [
          { model: Crianca, as: 'crianca' },
          { model: Creche, as: 'creche' }
        ]
      });

      return res.status(201).json({
        success: true,
        message: 'Matrícula solicitada com sucesso',
        data: matricula
      });
    } catch (error) {
      console.error('Erro ao criar matrícula:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao criar matrícula',
        error: error.message
      });
    }
  }

  /**
   * Atualizar status da matrícula (gestor aceita/rejeita)
   * PUT /matriculas/:id/status
   */
  async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      // Validar status
      if (!['aceite', 'rejeitado'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Status inválido. Use: aceite ou rejeitado'
        });
      }

      const matricula = await Matricula.findByPk(id, {
        include: [
          {
            model: Creche,
            as: 'creche'
          }
        ]
      });

      if (!matricula) {
        return res.status(404).json({
          success: false,
          message: 'Matrícula não encontrada'
        });
      }

      // Verificar se o usuário é o gestor da creche ou admin
      if (matricula.creche.user_id !== req.user.id && req.user.tipo !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Sem permissão para alterar esta matrícula'
        });
      }

      matricula.status = status;
      await matricula.save();

      // Recarregar com relacionamentos
      await matricula.reload({
        include: [
          { model: Crianca, as: 'crianca' },
          { model: Creche, as: 'creche' },
          { model: User, as: 'pai', attributes: ['id', 'nome', 'telefone'] }
        ]
      });

      return res.status(200).json({
        success: true,
        message: `Matrícula ${status === 'aceite' ? 'aceite' : 'rejeitada'} com sucesso`,
        data: matricula
      });
    } catch (error) {
      console.error('Erro ao atualizar status da matrícula:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao atualizar status da matrícula',
        error: error.message
      });
    }
  }

  /**
   * Eliminar/Cancelar matrícula
   * DELETE /matriculas/:id
   */
  async delete(req, res) {
    try {
      const { id } = req.params;

      const matricula = await Matricula.findByPk(id, {
        include: [{ model: Creche, as: 'creche' }]
      });

      if (!matricula) {
        return res.status(404).json({
          success: false,
          message: 'Matrícula não encontrada'
        });
      }

      // Verificar permissão:
      // 1. O pai que criou a matrícula
      // 2. O gestor da creche correspondente
      // 3. Admin
      const isOwner = matricula.user_id === req.user.id;
      const isGestorOfCreche = matricula.creche && matricula.creche.user_id === req.user.id;
      const isAdmin = req.user.tipo === 'admin';

      if (!isOwner && !isGestorOfCreche && !isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Sem permissão para eliminar esta matrícula'
        });
      }

      await matricula.destroy();

      return res.status(200).json({
        success: true,
        message: 'Matrícula eliminada com sucesso'
      });
    } catch (error) {
      console.error('Erro ao eliminar matrícula:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao eliminar matrícula',
        error: error.message
      });
    }
  }
}

module.exports = new MatriculaController();

