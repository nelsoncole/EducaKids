const { Creche, User, FotoCreche, Avaliacao } = require('../models');
const { Op } = require('sequelize');

class CrecheController {
  /**
   * Listar todas as creches
   * GET /creches
   */
  async index(req, res) {
    try {
      const { search, page = 1, limit = 10, sort } = req.query;
      const offset = (page - 1) * limit;

      const where = {};

      if (search) {
        where[Op.or] = [
          { nome: { [Op.like]: `%${search}%` } },
          { endereco: { [Op.like]: `%${search}%` } }
        ];
      }

      // Definir ordenação baseada no parâmetro sort
      let order = [['created_at', 'DESC']]; // Default: mais novas primeiro

      if (sort === 'price_asc') {
        order = [['mensalidade', 'ASC']]; // Mais baratas primeiro
      } else if (sort === 'price_desc') {
        order = [['mensalidade', 'DESC']]; // Mais caras primeiro
      } else if (sort === 'newest') {
        order = [['created_at', 'DESC']]; // Mais novas primeiro
      } else if (sort === 'oldest') {
        order = [['created_at', 'ASC']]; // Mais antigas primeiro
      }

      const creches = await Creche.findAndCountAll({
        where,
        include: [
          {
            model: User,
            as: 'gestor',
            attributes: ['id', 'nome', 'telefone', 'email']
          },
          {
            model: FotoCreche,
            as: 'fotos'
          },
          {
            model: Avaliacao,
            as: 'avaliacoes',
            attributes: ['estrelas', 'verificado']
          }
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: order
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
   * Obter detalhes de uma creche
   * GET /creches/:id
   */
  async show(req, res) {
    try {
      const { id } = req.params;

      const creche = await Creche.findByPk(id, {
        include: [
          {
            model: User,
            as: 'gestor',
            attributes: ['id', 'nome', 'telefone', 'email']
          },
          {
            model: FotoCreche,
            as: 'fotos'
          },
          {
            model: Avaliacao,
            as: 'avaliacoes',
            include: [
              {
                model: User,
                as: 'usuario',
                attributes: ['id', 'nome', 'foto_perfil']
              }
            ]
          }
        ]
      });

      if (!creche) {
        return res.status(404).json({
          success: false,
          message: 'Creche não encontrada'
        });
      }

      return res.status(200).json({
        success: true,
        data: creche
      });
    } catch (error) {
      console.error('Erro ao obter creche:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao obter creche',
        error: error.message
      });
    }
  }

  /**
   * Criar nova creche
   * POST /creches
   */
  async create(req, res) {
    try {
      const { nome, endereco, mensalidade, horario, descricao, fotos } = req.body;

      // Validações
      if (!nome || !endereco) {
        return res.status(400).json({
          success: false,
          message: 'Nome e endereço são obrigatórios'
        });
      }

      // Verificar se usuário é gestor
      if (req.user.tipo !== 'gestor' && req.user.tipo !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Apenas gestores podem cadastrar creches'
        });
      }

      // Criar creche
      const creche = await Creche.create({
        user_id: req.user.id,
        nome,
        endereco,
        mensalidade,
        horario,
        descricao
      });

      // Adicionar fotos se fornecidas
      if (fotos && Array.isArray(fotos)) {
        for (const foto of fotos) {
          await FotoCreche.create({
            creche_id: creche.id,
            imagem: foto
          });
        }
      }

      // Recarregar com fotos
      await creche.reload({
        include: [
          { model: FotoCreche, as: 'fotos' }
        ]
      });

      return res.status(201).json({
        success: true,
        message: 'Creche criada com sucesso',
        data: creche
      });
    } catch (error) {
      console.error('Erro ao criar creche:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao criar creche',
        error: error.message
      });
    }
  }

  /**
   * Atualizar creche
   * PUT /creches/:id
   */
  async update(req, res) {
    try {
      const { id } = req.params;
      const { nome, endereco, mensalidade, horario, descricao } = req.body;

      const creche = await Creche.findByPk(id);

      if (!creche) {
        return res.status(404).json({
          success: false,
          message: 'Creche não encontrada'
        });
      }

      // Verificar se o usuário é o gestor da creche ou admin
      if (creche.user_id !== req.user.id && req.user.tipo !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Sem permissão para editar esta creche'
        });
      }

      // Atualizar
      if (nome) creche.nome = nome;
      if (endereco) creche.endereco = endereco;
      if (mensalidade !== undefined) creche.mensalidade = mensalidade;
      if (horario) creche.horario = horario;
      if (descricao) creche.descricao = descricao;

      await creche.save();

      return res.status(200).json({
        success: true,
        message: 'Creche atualizada com sucesso',
        data: creche
      });
    } catch (error) {
      console.error('Erro ao atualizar creche:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao atualizar creche',
        error: error.message
      });
    }
  }

  /**
   * Deletar creche
   * DELETE /creches/:id
   */
  async delete(req, res) {
    try {
      const { id } = req.params;

      const creche = await Creche.findByPk(id);

      if (!creche) {
        return res.status(404).json({
          success: false,
          message: 'Creche não encontrada'
        });
      }

      // Verificar se o usuário é o gestor da creche ou admin
      if (creche.user_id !== req.user.id && req.user.tipo !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Sem permissão para eliminar esta creche'
        });
      }

      await creche.destroy();

      return res.status(200).json({
        success: true,
        message: 'Creche eliminada com sucesso'
      });
    } catch (error) {
      console.error('Erro ao eliminar creche:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao eliminar creche',
        error: error.message
      });
    }
  }

  /**
   * Adicionar foto à creche
   * POST /creches/:id/fotos
   */
  async addFoto(req, res) {
    try {
      const { id } = req.params;
      const { imagem } = req.body;

      const creche = await Creche.findByPk(id);

      if (!creche) {
        return res.status(404).json({
          success: false,
          message: 'Creche não encontrada'
        });
      }

      // Verificar permissão
      if (creche.user_id !== req.user.id && req.user.tipo !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Sem permissão para adicionar fotos a esta creche'
        });
      }

      const foto = await FotoCreche.create({
        creche_id: id,
        imagem
      });

      return res.status(201).json({
        success: true,
        message: 'Foto adicionada com sucesso',
        data: foto
      });
    } catch (error) {
      console.error('Erro ao adicionar foto:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao adicionar foto',
        error: error.message
      });
    }
  }

  /**
   * Remover foto da creche
   * DELETE /creches/fotos/:fotoId
   */
  async removeFoto(req, res) {
    try {
      const { fotoId } = req.params;

      const foto = await FotoCreche.findByPk(fotoId, {
        include: [{ model: Creche, as: 'creche' }]
      });

      if (!foto) {
        return res.status(404).json({
          success: false,
          message: 'Foto não encontrada'
        });
      }

      // Verificar permissão (gestor da creche ou admin)
      if (foto.creche.user_id !== req.user.id && req.user.tipo !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Sem permissão para remover esta foto'
        });
      }

      await foto.destroy();

      return res.status(200).json({
        success: true,
        message: 'Foto removida com sucesso'
      });
    } catch (error) {
      console.error('Erro ao remover foto:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao remover foto',
        error: error.message
      });
    }
  }
}

module.exports = new CrecheController();

