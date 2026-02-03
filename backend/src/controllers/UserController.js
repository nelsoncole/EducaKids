const { User, Crianca, Matricula } = require('../models');

class UserController {
  /**
   * Obter perfil do usuário
   * GET /users/profile
   */
  async getProfile(req, res) {
    try {
      const include = [
        {
          model: Crianca,
          as: 'criancas'
        }
      ];

      // Se for gestor, incluir a creche
      if (req.user.tipo === 'gestor') {
        const { Creche } = require('../models');
        include.push({
          model: Creche,
          as: 'creches'
        });
      }

      const user = await User.findByPk(req.user.id, {
        include
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuário não encontrado'
        });
      }

      return res.status(200).json({
        success: true,
        data: user
      });
    } catch (error) {
      console.error('Erro ao obter perfil:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao obter perfil',
        error: error.message
      });
    }
  }

  /**
   * Atualizar perfil do usuário
   * PUT /users/profile
   */
  async updateProfile(req, res) {
    try {
      const { nome, email, telefone, foto_perfil } = req.body;

      const user = await User.findByPk(req.user.id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuário não encontrado'
        });
      }

      // Atualizar apenas campos permitidos
      if (nome) user.nome = nome;
      if (email) user.email = email;
      if (telefone) user.telefone = telefone;
      if (foto_perfil) user.foto_perfil = foto_perfil;

      await user.save();

      return res.status(200).json({
        success: true,
        message: 'Perfil atualizado com sucesso',
        data: user
      });
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao atualizar perfil',
        error: error.message
      });
    }
  }

  /**
   * Deletar conta do usuário
   * DELETE /users/account
   */
  async deleteAccount(req, res) {
    try {
      const user = await User.findByPk(req.user.id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuário não encontrado'
        });
      }

      // Deletar usuário (cascade vai deletar dados relacionados)
      await user.destroy();

      return res.status(200).json({
        success: true,
        message: 'Conta eliminada com sucesso'
      });
    } catch (error) {
      console.error('Erro ao eliminar conta:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao eliminar conta',
        error: error.message
      });
    }
  }

  /**
   * Alterar tipo de usuário para gestor
   * POST /users/become-gestor
   */
  async becomeGestor(req, res) {
    try {
      const user = await User.findByPk(req.user.id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuário não encontrado'
        });
      }

      if (user.tipo === 'admin') {
        return res.status(400).json({
          success: false,
          message: 'Administradores não podem mudar de tipo'
        });
      }

      user.tipo = 'gestor';
      await user.save();

      return res.status(200).json({
        success: true,
        message: 'Conta alterada para gestor com sucesso',
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

module.exports = new UserController();

