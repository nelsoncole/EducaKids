# EducaKids - Backend API

Backend API REST para o aplicativo móvel EducaKids - sistema de avaliação e matrícula de creches.

## 🚀 Tecnologias

- **Node.js** - Ambiente de execução JavaScript
- **Express** - Framework web
- **MySQL** - Banco de dados relacional
- **Sequelize** - ORM para Node.js
- **JWT** - Autenticação com tokens
- **Bcrypt** - Criptografia de senhas

## 📋 Pré-requisitos

- Node.js (v14 ou superior)
- MySQL (v5.7 ou superior)
- npm ou yarn

## 🔧 Instalação

1. Clone o repositório:
```bash
git clone <url-do-repositorio>
cd EducaKids/backend
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp env.sample .env
```

4. Edite o arquivo `.env` com suas configurações:
```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=educakids
DB_USER=root
DB_PASSWORD=sua_senha
JWT_SECRET=sua_chave_secreta
```

5. Crie o banco de dados:
```bash
mysql -u root -p < src/database/schema.sql
```

## ▶️ Executar o Projeto

### Modo desenvolvimento (com auto-reload):
```bash
npm run dev
```

### Modo produção:
```bash
npm start
```

O servidor estará disponível em: `http://localhost:3000`

## 📚 Documentação da API

### Autenticação

#### Solicitar OTP
```http
POST /api/auth/request-otp
Content-Type: application/json

{
  "telefone": "+258840000000"
}
```

#### Verificar OTP e Login
```http
POST /api/auth/verify-otp
Content-Type: application/json

{
  "telefone": "+258840000000",
  "codigo": "123456",
  "nome": "Nome do Usuário" // Obrigatório apenas para novo cadastro
}
```

### Creches

#### Listar creches
```http
GET /api/creches?page=1&limit=10&search=nome
```

#### Obter detalhes de uma creche
```http
GET /api/creches/:id
```

#### Criar creche (requer autenticação como gestor)
```http
POST /api/creches
Authorization: Bearer {token}
Content-Type: application/json

{
  "nome": "Creche ABC",
  "endereco": "Rua X, nº 123",
  "mensalidade": 5000.00,
  "horario": "7h às 18h",
  "descricao": "Descrição da creche",
  "fotos": ["url1", "url2"]
}
```

### Avaliações

#### Criar avaliação
```http
POST /api/avaliacoes
Authorization: Bearer {token}
Content-Type: application/json

{
  "creche_id": 1,
  "estrelas": 5,
  "comentario": "Excelente creche!",
  "recomenda": true
}
```

#### Listar avaliações de uma creche
```http
GET /api/avaliacoes/creche/:creche_id
```

### Matrículas

#### Criar matrícula
```http
POST /api/matriculas
Authorization: Bearer {token}
Content-Type: application/json

{
  "creche_id": 1,
  "crianca_id": 1
}
```

#### Aceitar/Rejeitar matrícula (gestor)
```http
PUT /api/matriculas/:id/status
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "aceite" // ou "rejeitado"
}
```

## 👥 Tipos de Usuários

1. **Pai** - Pode avaliar creches, cadastrar crianças e solicitar matrículas
2. **Gestor** - Pode cadastrar e gerenciar creches, aceitar/rejeitar matrículas
3. **Admin** - Acesso total ao sistema

## 🔐 Regras de Negócio

- Um pai só pode avaliar uma vez cada creche
- Avaliação recebe selo "verificado" se houver matrícula aceite
- Gestor só pode gerenciar suas próprias creches
- Admin tem acesso total ao sistema
- Matrícula deve ser aceite pelo gestor da creche

## 📁 Estrutura do Projeto

```
backend/
├── src/
│   ├── config/          # Configurações
│   ├── controllers/     # Controladores
│   ├── database/        # Conexão e schema do BD
│   ├── middlewares/     # Middlewares (auth, validação)
│   ├── models/          # Models Sequelize
│   ├── routes/          # Rotas da API
│   ├── services/        # Lógica de negócio
│   └── server.js        # Arquivo principal
├── .env.sample          # Exemplo de variáveis de ambiente
├── .gitignore           # Arquivos ignorados pelo Git
├── package.json         # Dependências e scripts
└── README.md            # Este arquivo
```

## 🧪 Testando a API

Use ferramentas como:
- **Postman**
- **Insomnia**
- **cURL**

Ou acesse o health check:
```
http://localhost:3000/api/health
```

## 👨‍💻 Desenvolvimento

O desenvolvimento seguiu a ordem correta conforme documentação:
1. ✅ Modelagem do sistema
2. ✅ Base de dados (FASE 2)
3. ✅ Models (FASE 3)
4. ✅ Autenticação e Permissões (FASE 4)
5. ✅ Controllers (FASE 5)
6. ✅ Rotas da API (FASE 6)
7. ✅ Regras de Negócio (FASE 7)

## 📝 Licença

Este projeto está sob a licença MIT.

