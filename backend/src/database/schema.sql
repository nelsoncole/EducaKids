-- ==========================================
-- EDUCAKIDS - SCHEMA DA BASE DE DADOS
-- Seguindo FASE 2 da documentação
-- ==========================================

CREATE DATABASE IF NOT EXISTS educakids
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE educakids;

-- ==========================================
-- TABELA: users
-- Armazena todos os usuários (pais, gestores, admins)
-- ==========================================
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  telefone VARCHAR(20) UNIQUE,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  foto_perfil VARCHAR(500),
  tipo ENUM('pai', 'mae', 'gestor', 'admin') NOT NULL DEFAULT 'pai',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_tipo (tipo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- TABELA: creches
-- Armazena informações das creches
-- ==========================================
CREATE TABLE IF NOT EXISTS creches (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  nome VARCHAR(255) NOT NULL,
  endereco TEXT NOT NULL,
  mensalidade DECIMAL(10, 2), -- Valor em Kwanza (AOA)
  horario VARCHAR(100),
  descricao TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- TABELA: fotos_creche
-- Armazena fotos das creches
-- ==========================================
CREATE TABLE IF NOT EXISTS fotos_creche (
  id INT AUTO_INCREMENT PRIMARY KEY,
  creche_id INT NOT NULL,
  imagem VARCHAR(500) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (creche_id) REFERENCES creches(id) ON DELETE CASCADE,
  INDEX idx_creche_id (creche_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- TABELA: criancas
-- Armazena informações das crianças
-- ==========================================
CREATE TABLE IF NOT EXISTS criancas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  nome VARCHAR(255) NOT NULL,
  data_nascimento DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- TABELA: matriculas
-- Armazena pedidos de matrícula
-- ==========================================
CREATE TABLE IF NOT EXISTS matriculas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  creche_id INT NOT NULL,
  crianca_id INT NOT NULL,
  user_id INT NOT NULL,
  status ENUM('pendente', 'aceite', 'rejeitado') NOT NULL DEFAULT 'pendente',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (creche_id) REFERENCES creches(id) ON DELETE CASCADE,
  FOREIGN KEY (crianca_id) REFERENCES criancas(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_creche_id (creche_id),
  INDEX idx_crianca_id (crianca_id),
  INDEX idx_user_id (user_id),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- TABELA: avaliacoes
-- Armazena avaliações das creches
-- ==========================================
CREATE TABLE IF NOT EXISTS avaliacoes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  creche_id INT NOT NULL,
  estrelas INT NOT NULL CHECK (estrelas >= 1 AND estrelas <= 5),
  comentario TEXT,
  recomenda BOOLEAN DEFAULT TRUE,
  verificado BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (creche_id) REFERENCES creches(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_creche (user_id, creche_id),
  INDEX idx_user_id (user_id),
  INDEX idx_creche_id (creche_id),
  INDEX idx_verificado (verificado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- TABELA: auth_tokens
-- Armazena tokens de autenticação
-- ==========================================
CREATE TABLE IF NOT EXISTS auth_tokens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  token VARCHAR(500) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_token (token(255))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- TABELA: otp_codes
-- Armazena códigos OTP para autenticação
-- ==========================================
CREATE TABLE IF NOT EXISTS otp_codes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  telefone VARCHAR(20) NOT NULL,
  codigo VARCHAR(6) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  usado BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_telefone (telefone),
  INDEX idx_codigo (codigo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- DADOS INICIAIS
-- ==========================================

-- Inserir usuário admin padrão (Senha: admin123)
INSERT INTO users (nome, telefone, email, password, tipo) 
VALUES ('Administrador', '939227097', 'admin@educakids.com', '$2a$10$7/vA6C1u9Q6O8f0V8O5uZu6yC2f0U0W1Z1X1X1X1X1X1X1X1X', 'admin')
ON DUPLICATE KEY UPDATE nome = nome;

