# 📡 Exemplos de Requisições - EducaKids API

Este documento contém exemplos práticos de todas as requisições da API.

## 🔐 Autenticação

### 1. Registar Usuário
```http
POST http://localhost:3000/api/auth/register
Content-Type: application/json

{
  "nome": "João Silva",
  "email": "joao@email.com",
  "password": "senha123",
  "telefone": "+258840000000"
  "tipo": "gestor"
}
```

### 2. Fazer Login
```http
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "joao@email.com",
  "password": "senha123"
}
```

### 3. Obter dados do usuário autenticado
```http
GET http://localhost:3000/api/auth/me
Authorization: Bearer SEU_TOKEN_AQUI
```

### 4. Logout
```http
POST http://localhost:3000/api/auth/logout
Authorization: Bearer SEU_TOKEN_AQUI
```

---

## 👤 Usuários

### 5. Obter perfil
```http
GET http://localhost:3000/api/users/profile
Authorization: Bearer SEU_TOKEN_AQUI
```

### 6. Atualizar perfil
```http
PUT http://localhost:3000/api/users/profile
Authorization: Bearer SEU_TOKEN_AQUI
Content-Type: application/json

{
  "nome": "João Silva Atualizado",
  "email": "joao@email.com",
  "foto_perfil": "https://example.com/foto.jpg"
}
```

### 7. Tornar-se gestor
```http
POST http://localhost:3000/api/users/become-gestor
Authorization: Bearer SEU_TOKEN_AQUI
```

### 8. Deletar conta
```http
DELETE http://localhost:3000/api/users/account
Authorization: Bearer SEU_TOKEN_AQUI
```

---

## 🏫 Creches

### 9. Listar todas as creches (público)
```http
GET http://localhost:3000/api/creches?page=1&limit=10&search=abc
```

### 10. Obter detalhes de uma creche (público)
```http
GET http://localhost:3000/api/creches/1
```

### 11. Criar creche (gestor ou admin)
```http
POST http://localhost:3000/api/creches
Authorization: Bearer SEU_TOKEN_AQUI
Content-Type: application/json

{
  "nome": "Creche Sol Nascente",
  "endereco": "Av. Julius Nyerere, nº 1234, Maputo",
  "mensalidade": 8500.00,
  "horario": "7h às 18h",
  "descricao": "Creche com infraestrutura moderna e equipe qualificada",
  "fotos": [
    "https://example.com/foto1.jpg",
    "https://example.com/foto2.jpg"
  ]
}
```

---

## 👶 Crianças

### 12. Cadastrar criança
```http
POST http://localhost:3000/api/criancas
Authorization: Bearer SEU_TOKEN_AQUI
Content-Type: application/json

{
  "nome": "Maria Silva",
  "data_nascimento": "2020-05-15"
}
```

---

## 📝 Matrículas

### 13. Criar matrícula
```http
POST http://localhost:3000/api/matriculas
Authorization: Bearer SEU_TOKEN_AQUI
Content-Type: application/json

a
```

---

## ⭐ Avaliações

### 14. Criar avaliação
```http
POST http://localhost:3000/api/avaliacoes
Authorization: Bearer SEU_TOKEN_AQUI
Content-Type: application/json

{
  "creche_id": 1,
  "estrelas": 5,
  "comentario": "Excelente creche!",
  "recomenda": true
}
```

---

## 👨‍💼 Admin

### 15. Obter estatísticas gerais
```http
GET http://localhost:3000/api/admin/stats
Authorization: Bearer SEU_TOKEN_ADMIN
```

---

## 🏥 Utilitários

### 16. Health Check
```http
GET http://localhost:3000/api/health
```
