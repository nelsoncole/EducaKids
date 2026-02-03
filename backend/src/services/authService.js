const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User } = require('../models');
require('dotenv').config();

class AuthService {
  /**
   * Criptografa uma senha
   */
  async hashPassword(password) {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  }

  /**
   * Compara uma senha com o hash
   */
  async comparePassword(password, hash) {
    return await bcrypt.compare(password, hash);
  }

  /**
   * Gera token JWT
   */
  generateToken(user) {
    const payload = {
      id: user.id,
      email: user.email,
      tipo: user.tipo
    };

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET || 'secret_key_default',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    return token;
  }

  /**
   * Verifica token JWT
   */
  verifyToken(token) {
    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'secret_key_default'
      );
      return decoded;
    } catch (error) {
      return null;
    }
  }

  /**
   * Armazena token no banco de dados
   */
  async storeToken(userId, token) {
    const { sequelize } = require('../database/connection');

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await sequelize.query(
      'INSERT INTO auth_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
      {
        replacements: [userId, token, expiresAt],
        type: sequelize.QueryTypes.INSERT
      }
    );

    return true;
  }

  /**
   * Remove token do banco de dados (logout)
   */
  async removeToken(token) {
    const { sequelize } = require('../database/connection');

    await sequelize.query(
      'DELETE FROM auth_tokens WHERE token = ?',
      {
        replacements: [token],
        type: sequelize.QueryTypes.DELETE
      }
    );

    return true;
  }
}

module.exports = new AuthService();
