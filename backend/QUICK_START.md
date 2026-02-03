# ⚡ Quick Start - EducaKids Backend

Guia rápido para começar a usar o backend em **5 minutos**.

## 📦 1. Instalar (1 minuto)

```bash
cd backend
npm install
```

## 🗄️ 2. Criar Banco de Dados (1 minuto)

```bash
mysql -u root -p < src/database/schema.sql
```

Ou copie o conteúdo de `src/database/schema.sql` e execute no MySQL Workbench.

## ⚙️ 3. Configurar (1 minuto)

```bash
cp env.sample .env
```

Edite o `.env`:
```env
DB_PASSWORD=sua_senha_mysql
JWT_SECRET=chave_secreta_123
```

## ▶️ 4. Executar (10 segundos)

```bash
npm run dev
```

## ✅ 5. Testar (30 segundos)

Abra o navegador: `http://localhost:3000/api/health`

Ou use cURL:
```bash
curl http://localhost:3000/api/health
```

---

## 🎯 Teste Completo (2 minutos)

### 1. Registrar Usuário
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"nome":"João Silva","email":"joao@email.com","password":"senha123"}'
```

### 2. Fazer Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"joao@email.com","password":"senha123"}'
```

Copie o `token` da resposta.

### 3. Listar Creches
```bash
curl http://localhost:3000/api/creches
```

---

## 🔥 Dica Pro

Use **Postman** ou **Insomnia** para testar a API de forma visual.

Importe os exemplos de `API_EXAMPLES.md`.

---

## 📚 Documentação Completa

- `README.md` - Documentação principal
- `INSTALLATION.md` - Guia detalhado
- `API_EXAMPLES.md` - Todos os endpoints
- `DESENVOLVIMENTO.md` - Resumo do projeto

---

## 🆘 Problemas?

### Erro de conexão MySQL
```bash
# Verificar se MySQL está rodando
mysql -u root -p

# Verificar credenciais no .env
```

### Porta 3000 em uso
```env
# Altere no .env
PORT=3001
```

### Módulos não encontrados
```bash
rm -rf node_modules package-lock.json
npm install
```

---

## ✨ Pronto!

Seu backend está rodando em: `http://localhost:3000`

API disponível em: `http://localhost:3000/api`

Agora você pode:
- ✅ Testar todos os endpoints
- ✅ Desenvolver o frontend
- ✅ Integrar com React Native

Boa sorte! 🚀

