/**
 * REGRAS DE NEGÓCIO DO EDUCAKIDS
 * Seguindo FASE 7 da documentação
 */

const { Avaliacao, Matricula, Creche, User } = require('../models');

class BusinessRules {
  /**
   * REGRA 1: Um pai só pode avaliar uma vez cada creche
   * Verifica se o usuário já avaliou a creche
   */
  async canUserReviewCreche(userId, crecheId) {
    const avaliacaoExistente = await Avaliacao.findOne({
      where: {
        user_id: userId,
        creche_id: crecheId
      }
    });

    return !avaliacaoExistente;
  }

  /**
   * REGRA 2: Avaliação é verificada se existir matrícula aceite
   * Verifica se o usuário tem matrícula aceite na creche
   */
  async isReviewVerified(userId, crecheId) {
    const matriculaAceite = await Matricula.findOne({
      where: {
        user_id: userId,
        creche_id: crecheId,
        status: 'aceite'
      }
    });

    return !!matriculaAceite;
  }

  /**
   * REGRA 3: Gestor só pode alterar a própria creche
   * Verifica se o gestor é dono da creche
   */
  async canUserManageCreche(userId, crecheId, userType) {
    // Admin pode gerenciar qualquer creche
    if (userType === 'admin') {
      return true;
    }

    const creche = await Creche.findOne({
      where: {
        id: crecheId,
        user_id: userId
      }
    });

    return !!creche;
  }

  /**
   * REGRA 4: Verificar se usuário pode aceitar/rejeitar matrícula
   * Gestor só pode gerenciar matrículas da própria creche
   */
  async canUserManageMatricula(userId, matriculaId, userType) {
    // Admin pode gerenciar qualquer matrícula
    if (userType === 'admin') {
      return true;
    }

    const matricula = await Matricula.findOne({
      where: { id: matriculaId },
      include: [
        {
          model: Creche,
          as: 'creche',
          where: { user_id: userId }
        }
      ]
    });

    return !!matricula;
  }

  /**
   * REGRA 5: Verificar se criança já tem matrícula ativa em alguma creche
   * Impede múltiplas matrículas ativas
   */
  async hasActiveMatricula(criancaId, crecheId) {
    const matriculaAtiva = await Matricula.findOne({
      where: {
        crianca_id: criancaId,
        creche_id: crecheId,
        status: 'aceite'
      }
    });

    return !!matriculaAtiva;
  }

  /**
   * REGRA 6: Atualizar selo verificado nas avaliações quando matrícula é aceite
   * Quando uma matrícula é aceite, todas as avaliações do usuário para aquela creche
   * devem receber o selo verificado
   */
  async updateVerifiedReviews(userId, crecheId) {
    await Avaliacao.update(
      { verificado: true },
      {
        where: {
          user_id: userId,
          creche_id: crecheId
        }
      }
    );
  }

  /**
   * REGRA 7: Remover selo verificado quando matrícula é rejeitada ou cancelada
   */
  async removeVerifiedReviews(userId, crecheId) {
    // Verificar se ainda existe alguma matrícula aceite
    const matriculaAceite = await Matricula.findOne({
      where: {
        user_id: userId,
        creche_id: crecheId,
        status: 'aceite'
      }
    });

    // Se não houver mais matrícula aceite, remover selo
    if (!matriculaAceite) {
      await Avaliacao.update(
        { verificado: false },
        {
          where: {
            user_id: userId,
            creche_id: crecheId
          }
        }
      );
    }
  }

  /**
   * REGRA 8: Verificar se usuário pode cadastrar creche
   * Apenas gestores e admins podem cadastrar creches
   */
  canUserCreateCreche(userType) {
    return ['gestor', 'admin'].includes(userType);
  }

  /**
   * REGRA 9: Verificar se usuário pode deletar usuário
   * Admin não pode deletar outro admin
   */
  async canDeleteUser(targetUserId, currentUserType) {
    if (currentUserType !== 'admin') {
      return false;
    }

    const targetUser = await User.findByPk(targetUserId);
    
    if (!targetUser) {
      return false;
    }

    // Admin não pode deletar outro admin
    return targetUser.tipo !== 'admin';
  }

  /**
   * REGRA 10: Calcular média de avaliações de uma creche
   */
  async calculateCrecheRating(crecheId) {
    const avaliacoes = await Avaliacao.findAll({
      where: { creche_id: crecheId }
    });

    if (avaliacoes.length === 0) {
      return {
        mediaEstrelas: 0,
        totalAvaliacoes: 0,
        totalVerificadas: 0
      };
    }

    const somaEstrelas = avaliacoes.reduce((acc, a) => acc + a.estrelas, 0);
    const mediaEstrelas = (somaEstrelas / avaliacoes.length).toFixed(1);
    const totalVerificadas = avaliacoes.filter(a => a.verificado).length;

    return {
      mediaEstrelas: parseFloat(mediaEstrelas),
      totalAvaliacoes: avaliacoes.length,
      totalVerificadas
    };
  }

  /**
   * REGRA 11: Validar se usuário pode matricular criança
   * A criança deve pertencer ao usuário
   */
  async canUserEnrollChild(userId, criancaId) {
    const { Crianca } = require('../models');
    
    const crianca = await Crianca.findOne({
      where: {
        id: criancaId,
        user_id: userId
      }
    });

    return !!crianca;
  }

  /**
   * REGRA 12: Verificar se usuário pode editar/deletar criança
   */
  async canUserManageCrianca(userId, criancaId) {
    const { Crianca } = require('../models');
    
    const crianca = await Crianca.findOne({
      where: {
        id: criancaId,
        user_id: userId
      }
    });

    return !!crianca;
  }
}

module.exports = new BusinessRules();

