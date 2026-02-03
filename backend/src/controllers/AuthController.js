const { User } = require('../models');
const authService = require('../services/authService');

class AuthController {
  /**
   * Realizar login por email e password
   * POST /auth/login
   */
  async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email e palavra-passe são obrigatórios'
        });
      }

      // Buscar usuário pelo email
      const user = await User.findOne({ where: { email } });

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Email ou palavra-passe incorretos'
        });
      }

      // Verificar password
      const isPasswordValid = await authService.comparePassword(password, user.password);

      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Email ou palavra-passe incorretos'
        });
      }

      // Gerar token
      const token = authService.generateToken(user);

      // Armazenar token
      await authService.storeToken(user.id, token);

      return res.status(200).json({
        success: true,
        message: 'Login realizado com sucesso',
        data: {
          token,
          user: {
            id: user.id,
            nome: user.nome,
            email: user.email,
            telefone: user.telefone,
            foto_perfil: user.foto_perfil,
            tipo: user.tipo
          }
        }
      });
    } catch (error) {
      console.error('Erro ao realizar login:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao realizar login',
        error: error.message
      });
    }
  }

  /**
   * Registrar novo usuário
   * POST /auth/register
   */
  async register(req, res) {
    try {
      const { nome, email, password, telefone, tipo } = req.body;

      if (!nome || !email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Nome, email e palavra-passe são obrigatórios'
        });
      }

      // Verificar se o email já existe
      const userExists = await User.findOne({ where: { email } });

      if (userExists) {
        return res.status(400).json({
          success: false,
          message: 'Este email já está em uso'
        });
      }

      // Criptografar password
      const hashedPassword = await authService.hashPassword(password);

      // Criar usuário
      const user = await User.create({
        nome,
        email,
        password: hashedPassword,
        telefone,
        tipo: tipo || 'pai'
      });

      // Gerar token
      const token = authService.generateToken(user);

      // Armazenar token
      await authService.storeToken(user.id, token);

      return res.status(201).json({
        success: true,
        message: 'Usuário registado com sucesso',
        data: {
          token,
          user: {
            id: user.id,
            nome: user.nome,
            email: user.email,
            telefone: user.telefone,
            tipo: user.tipo
          }
        }
      });
    } catch (error) {
      console.error('Erro ao registar usuário:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao registar usuário',
        error: error.message
      });
    }
  }

  /**
   * Logout
   * POST /auth/logout
   */
  async logout(req, res) {
    try {
      const authHeader = req.headers.authorization;

      if (authHeader) {
        const token = authHeader.split(' ')[1];
        await authService.removeToken(token);
      }

      return res.status(200).json({
        success: true,
        message: 'Logout realizado com sucesso'
      });
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao fazer logout',
        error: error.message
      });
    }
  }

  /**
   * Obter usuário autenticado
   * GET /auth/me
   */
  async getMe(req, res) {
    try {
      const user = await User.findByPk(req.user.id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuário não encontrado'
        });
      }

      return res.status(200).json({
        success: true,
        data: {
          id: user.id,
          nome: user.nome,
          email: user.email,
          telefone: user.telefone,
          foto_perfil: user.foto_perfil,
          tipo: user.tipo
        }
      });
    } catch (error) {
      console.error('Erro ao obter usuário:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao obter usuário',
        error: error.message
      });
    }
  }
}

module.exports = new AuthController();
