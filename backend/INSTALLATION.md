# 🚀 Guia de Instalação - EducaKids Backend

Este guia irá ajudá-lo a configurar e executar o backend do EducaKids passo a passo.

## 📋 Requisitos

Antes de começar, certifique-se de ter instalado:

- ✅ Node.js (versão 14 ou superior)
- ✅ MySQL (versão 5.7 ou superior)
- ✅ npm (vem com Node.js)

### Verificar instalações:

```bash
node --version
npm --version
mysql --version
```

## 📦 Passo 1: Instalar Dependências

Navegue até a pasta backend e instale as dependências:

```bash
cd backend
npm install
```

Isso irá instalar:
- Express (servidor web)
- MySQL2 (driver MySQL)
- Sequelize (ORM)
- JWT (autenticação)
- Bcrypt (criptografia)
- Cors (segurança)
- E outras dependências necessárias

## 🗄️ Passo 2: Configurar Banco de Dados

### 2.1 Criar o Banco de Dados

1. Abra o MySQL:
```bash
mysql -u root -p
```

2. Execute o script SQL:
```bash
mysql -u root -p < src/database/schema.sql
```

**OU** copie e cole o conteúdo do arquivo `src/database/schema.sql` no MySQL Workbench.

### 2.2 Verificar se o banco foi criado:
```sql
SHOW DATABASES;
USE educakids;
SHOW TABLES;
```

Você deve ver as seguintes tabelas:
- users
- creches
- fotos_creche
- criancas
- matriculas
- avaliacoes
- auth_tokens
- otp_codes

## ⚙️ Passo 3: Configurar Variáveis de Ambiente

1. Copie o arquivo de exemplo:
```bash
cp env.sample .env
```

2. Edite o arquivo `.env` com suas configurações:

```env
# Servidor
PORT=3000
NODE_ENV=development

# MySQL
DB_HOST=localhost
DB_PORT=3306
DB_NAME=educakids
DB_USER=root
DB_PASSWORD=sua_senha_mysql_aqui

# JWT
JWT_SECRET=sua_chave_secreta_muito_segura_123456
JWT_EXPIRES_IN=7d

# OTP
OTP_EXPIRES_IN=5

# Upload
MAX_FILE_SIZE=5242880
```

⚠️ **IMPORTANTE**: 
- Substitua `sua_senha_mysql_aqui` pela sua senha do MySQL
- Substitua `sua_chave_secreta_muito_segura_123456` por uma chave secreta forte

## ▶️ Passo 4: Executar o Servidor

### Modo desenvolvimento (recomendado para desenvolvimento):
```bash
npm run dev
```

### Modo produção:
```bash
npm start
```

## ✅ Passo 5: Verificar se está funcionando

### 5.1 Verificar no terminal

Você deve ver algo como:

```
🚀 Iniciando servidor EducaKids...

📊 Testando conexão com o banco de dados...
✅ Conexão com o banco de dados estabelecida com sucesso.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎉 Servidor rodando em: http://localhost:3000
📡 API disponível em: http://localhost:3000/api
🏥 Health check: http://localhost:3000/api/health
🌍 Ambiente: development
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### 5.2 Testar no navegador ou Postman

Abra o navegador e acesse:

```
http://localhost:3000/api/health
```

Resposta esperada:
```json
{
  "success": true,
  "status": "OK",
  "timestamp": "2025-12-22T23:30:00.000Z"
}
```

### 5.3 Testar endpoint principal

```
http://localhost:3000/api
```

Resposta esperada:
```json
{
  "success": true,
  "message": "EducaKids API - Bem-vindo!",
  "version": "1.0.0",
  "endpoints": {
    "auth": "/auth",
    "users": "/users",
    "creches": "/creches",
    "criancas": "/criancas",
    "matriculas": "/matriculas",
    "avaliacoes": "/avaliacoes",
    "admin": "/admin"
  }
}
```

## 🧪 Passo 6: Testar Autenticação

### 6.1 Solicitar OTP

**Requisição:**
```http
POST http://localhost:3000/api/auth/request-otp
Content-Type: application/json

{
  "telefone": "+258840000000"
}
```

**Resposta:**
```json
{
  "success": true,
  "message": "Código OTP enviado com sucesso",
  "debug": {
    "codigo": "123456"
  }
}
```

⚠️ **Nota**: O código aparece apenas em modo desenvolvimento. Em produção, seria enviado por SMS.

### 6.2 Verificar OTP e fazer Login

**Requisição:**
```http
POST http://localhost:3000/api/auth/verify-otp
Content-Type: application/json

{
  "telefone": "+258840000000",
  "codigo": "123456",
  "nome": "João Silva"
}
```

**Resposta:**
```json
{
  "success": true,
  "message": "Login realizado com sucesso",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "nome": "João Silva",
      "telefone": "+258840000000",
      "tipo": "pai"
    }
  }
}
```

## 🔐 Passo 7: Criar Usuário Admin

Execute no MySQL:

```sql
USE educakids;

INSERT INTO users (nome, telefone, email, tipo) 
VALUES ('Administrador', '+258800000000', 'admin@educakids.com', 'admin');
```

Agora você pode fazer login com este telefone e terá acesso de admin.

## 🐛 Resolução de Problemas

### Erro: "Cannot connect to MySQL"
- Verifique se o MySQL está rodando
- Verifique as credenciais no arquivo `.env`
- Teste a conexão: `mysql -u root -p`

### Erro: "Database does not exist"
- Execute novamente o script SQL
- Verifique se o banco foi criado: `SHOW DATABASES;`

### Erro: "Port 3000 already in use"
- Altere a porta no arquivo `.env`
- Ou pare o processo usando a porta 3000

### Erro: "Cannot find module"
- Execute novamente: `npm install`
- Delete `node_modules` e `package-lock.json`, depois `npm install`

## 📞 Suporte

Para problemas ou dúvidas:
1. Verifique os logs no terminal
2. Consulte a documentação no README.md
3. Verifique a documentação oficial das tecnologias usadas

## ✨ Próximos Passos

Agora que o backend está funcionando:
1. ✅ Teste todos os endpoints com Postman
2. ✅ Configure o frontend mobile (React Native)
3. ✅ Integre o frontend com o backend
4. ✅ Implemente funcionalidades adicionais

Bom desenvolvimento! 🚀

