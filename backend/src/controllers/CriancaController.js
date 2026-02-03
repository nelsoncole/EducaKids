const { Crianca, Matricula, Creche } = require('../models');

class CriancaController {
  /**
   * Listar crianças do usuário
   * GET /criancas
   */
  async index(req, res) {
    try {
      const criancas = await Crianca.findAll({
        where: { user_id: req.user.id },
        include: [
          {
            model: Matricula,
            as: 'matriculas',
            include: [
              {
                model: Creche,
                as: 'creche',
                attributes: ['id', 'nome', 'endereco']
              }
            ]
          }
        ],
        order: [['created_at', 'DESC']]
      });

      return res.status(200).json({
        success: true,
        data: criancas
      });
    } catch (error) {
      console.error('Erro ao listar crianças:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao listar crianças',
        error: error.message
      });
    }
  }

  /**
   * Obter detalhes de uma criança
   * GET /criancas/:id
   */
  async show(req, res) {
    try {
      const { id } = req.params;

      const crianca = await Crianca.findOne({
        where: { 
          id,
          user_id: req.user.id 
        },
        include: [
          {
            model: Matricula,
            as: 'matriculas',
            include: [
              {
                model: Creche,
                as: 'creche'
              }
            ]
          }
        ]
      });

      if (!crianca) {
        return res.status(404).json({
          success: false,
          message: 'Criança não encontrada'
        });
      }

      return res.status(200).json({
        success: true,
        data: crianca
      });
    } catch (error) {
      console.error('Erro ao obter criança:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao obter criança',
        error: error.message
      });
    }
  }

  /**
   * Cadastrar nova criança
   * POST /criancas
   */
  async create(req, res) {
    try {
      const { nome, data_nascimento, genero, alergias, observacoes } = req.body;

      // Validações
      if (!nome || !data_nascimento) {
        return res.status(400).json({
          success: false,
          message: 'Nome e data de nascimento são obrigatórios'
        });
      }

      // Criar criança
      const crianca = await Crianca.create({
        user_id: req.user.id,
        nome,
        data_nascimento,
        genero,
        alergias,
        observacoes
      });

      return res.status(201).json({
        success: true,
        message: 'Criança cadastrada com sucesso',
        data: crianca
      });
    } catch (error) {
      console.error('Erro ao cadastrar criança:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao cadastrar criança',
        error: error.message
      });
    }
  }

  /**
   * Atualizar dados da criança
   * PUT /criancas/:id
   */
  async update(req, res) {
    try {
      const { id } = req.params;
      const { nome, data_nascimento, genero, alergias, observacoes } = req.body;

      const crianca = await Crianca.findOne({
        where: { 
          id,
          user_id: req.user.id 
        }
      });

      if (!crianca) {
        return res.status(404).json({
          success: false,
          message: 'Criança não encontrada'
        });
      }

      // Atualizar
      if (nome) crianca.nome = nome;
      if (data_nascimento) crianca.data_nascimento = data_nascimento;
      if (genero !== undefined) crianca.genero = genero;
      if (alergias !== undefined) crianca.alergias = alergias;
      if (observacoes !== undefined) crianca.observacoes = observacoes;

      await crianca.save();

      return res.status(200).json({
        success: true,
        message: 'Criança atualizada com sucesso',
        data: crianca
      });
    } catch (error) {
      console.error('Erro ao atualizar criança:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao atualizar criança',
        error: error.message
      });
    }
  }

  /**
   * Deletar criança
   * DELETE /criancas/:id
   */
  async delete(req, res) {
    try {
      const { id } = req.params;

      const crianca = await Crianca.findOne({
        where: { 
          id,
          user_id: req.user.id 
        }
      });

      if (!crianca) {
        return res.status(404).json({
          success: false,
          message: 'Criança não encontrada'
        });
      }

      await crianca.destroy();

      return res.status(200).json({
        success: true,
        message: 'Criança removida com sucesso'
      });
    } catch (error) {
      console.error('Erro ao remover criança:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao remover criança',
        error: error.message
      });
    }
  }
}

module.exports = new CriancaController();

