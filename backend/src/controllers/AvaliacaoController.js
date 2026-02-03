const { Avaliacao, User, Creche, Matricula } = require('../models');

class AvaliacaoController {
  /**
   * Listar avaliações de uma creche
   * GET /avaliacoes/creche/:creche_id
   */
  async indexByCreche(req, res) {
    try {
      const { creche_id } = req.params;
      const { verificado } = req.query;

      const where = { creche_id };
      
      // Filtrar por verificado se especificado
      if (verificado !== undefined) {
        where.verificado = verificado === 'true';
      }

      const avaliacoes = await Avaliacao.findAll({
        where,
        include: [
          {
            model: User,
            as: 'usuario',
            attributes: ['id', 'nome', 'foto_perfil']
          }
        ],
        order: [['created_at', 'DESC']]
      });

      return res.status(200).json({
        success: true,
        data: avaliacoes
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
   * Obter estatísticas de avaliações de uma creche
   * GET /avaliacoes/creche/:creche_id/stats
   */
  async getStats(req, res) {
    try {
      const { creche_id } = req.params;

      const avaliacoes = await Avaliacao.findAll({
        where: { creche_id }
      });

      const total = avaliacoes.length;
      const verificadas = avaliacoes.filter(a => a.verificado).length;
      const recomenda = avaliacoes.filter(a => a.recomenda).length;

      // Calcular média de estrelas
      const somaEstrelas = avaliacoes.reduce((acc, a) => acc + a.estrelas, 0);
      const mediaEstrelas = total > 0 ? (somaEstrelas / total).toFixed(1) : 0;

      // Distribuição de estrelas
      const distribuicao = {
        1: avaliacoes.filter(a => a.estrelas === 1).length,
        2: avaliacoes.filter(a => a.estrelas === 2).length,
        3: avaliacoes.filter(a => a.estrelas === 3).length,
        4: avaliacoes.filter(a => a.estrelas === 4).length,
        5: avaliacoes.filter(a => a.estrelas === 5).length
      };

      return res.status(200).json({
        success: true,
        data: {
          total,
          verificadas,
          mediaEstrelas: parseFloat(mediaEstrelas),
          recomenda,
          percentualRecomenda: total > 0 ? ((recomenda / total) * 100).toFixed(1) : 0,
          distribuicao
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
   * Criar avaliação
   * POST /avaliacoes
   */
  async create(req, res) {
    try {
      const { creche_id, estrelas, comentario, recomenda } = req.body;

      // Validações
      if (!creche_id || !estrelas) {
        return res.status(400).json({
          success: false,
          message: 'Creche e número de estrelas são obrigatórios'
        });
      }

      if (estrelas < 1 || estrelas > 5) {
        return res.status(400).json({
          success: false,
          message: 'Estrelas deve ser um valor entre 1 e 5'
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

      // Verificar se o usuário já avaliou esta creche
      const avaliacaoExistente = await Avaliacao.findOne({
        where: {
          user_id: req.user.id,
          creche_id
        }
      });

      if (avaliacaoExistente) {
        return res.status(400).json({
          success: false,
          message: 'Você já avaliou esta creche. Use a rota de atualização.'
        });
      }

      // Verificar se existe matrícula aceite (obrigatório para avaliar)
      const matriculaAceite = await Matricula.findOne({
        where: {
          user_id: req.user.id,
          creche_id,
          status: 'aceite'
        }
      });

      if (!matriculaAceite) {
        return res.status(403).json({
          success: false,
          message: 'Você só pode avaliar uma creche se o seu filho estiver matriculado nela.'
        });
      }

      // Criar avaliação
      const avaliacao = await Avaliacao.create({
        user_id: req.user.id,
        creche_id,
        estrelas,
        comentario: comentario || null,
        recomenda: recomenda !== undefined ? recomenda : true,
        verificado: true // Sempre verificado se passou pela trava acima
      });

      // Recarregar com relacionamentos
      await avaliacao.reload({
        include: [
          {
            model: User,
            as: 'usuario',
            attributes: ['id', 'nome', 'foto_perfil']
          }
        ]
      });

      return res.status(201).json({
        success: true,
        message: `Avaliação criada com sucesso${verificado ? ' (verificada)' : ''}`,
        data: avaliacao
      });
    } catch (error) {
      console.error('Erro ao criar avaliação:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao criar avaliação',
        error: error.message
      });
    }
  }

  /**
   * Atualizar avaliação
   * PUT /avaliacoes/:id
   */
  async update(req, res) {
    try {
      const { id } = req.params;
      const { estrelas, comentario, recomenda } = req.body;

      const avaliacao = await Avaliacao.findOne({
        where: {
          id,
          user_id: req.user.id
        }
      });

      if (!avaliacao) {
        return res.status(404).json({
          success: false,
          message: 'Avaliação não encontrada'
        });
      }

      // Atualizar
      if (estrelas !== undefined) {
        if (estrelas < 1 || estrelas > 5) {
          return res.status(400).json({
            success: false,
            message: 'Estrelas deve ser um valor entre 1 e 5'
          });
        }
        avaliacao.estrelas = estrelas;
      }
      
      if (comentario !== undefined) avaliacao.comentario = comentario;
      if (recomenda !== undefined) avaliacao.recomenda = recomenda;

      await avaliacao.save();

      // Recarregar com relacionamentos
      await avaliacao.reload({
        include: [
          {
            model: User,
            as: 'usuario',
            attributes: ['id', 'nome', 'foto_perfil']
          }
        ]
      });

      return res.status(200).json({
        success: true,
        message: 'Avaliação atualizada com sucesso',
        data: avaliacao
      });
    } catch (error) {
      console.error('Erro ao atualizar avaliação:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao atualizar avaliação',
        error: error.message
      });
    }
  }

  /**
   * Deletar avaliação
   * DELETE /avaliacoes/:id
   */
  async delete(req, res) {
    try {
      const { id } = req.params;

      const avaliacao = await Avaliacao.findOne({
        where: {
          id,
          user_id: req.user.id
        }
      });

      if (!avaliacao && req.user.tipo !== 'admin') {
        return res.status(404).json({
          success: false,
          message: 'Avaliação não encontrada'
        });
      }

      // Admin pode deletar qualquer avaliação
      if (req.user.tipo === 'admin' && !avaliacao) {
        const avaliacaoAdmin = await Avaliacao.findByPk(id);
        
        if (!avaliacaoAdmin) {
          return res.status(404).json({
            success: false,
            message: 'Avaliação não encontrada'
          });
        }

        await avaliacaoAdmin.destroy();
      } else {
        await avaliacao.destroy();
      }

      return res.status(200).json({
        success: true,
        message: 'Avaliação removida com sucesso'
      });
    } catch (error) {
      console.error('Erro ao remover avaliação:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao remover avaliação',
        error: error.message
      });
    }
  }
}

module.exports = new AvaliacaoController();

