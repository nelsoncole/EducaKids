# 📮 Coleção Postman - EducaKids API

Este documento contém uma coleção completa para testar a API no Postman.

## 🚀 Configuração Inicial

### 1. Criar Variáveis de Ambiente no Postman

Crie um ambiente chamado "EducaKids Local" com as seguintes variáveis:

```
base_url: http://localhost:3000/api
token: (deixe vazio - será preenchido automaticamente)
user_id: (deixe vazio - será preenchido automaticamente)
creche_id: (deixe vazio - será preenchido automaticamente)
crianca_id: (deixe vazio - será preenchido automaticamente)
```

### 2. Importar Coleção

Copie o JSON abaixo e importe no Postman (File > Import > Raw text):

```json
{
  "info": {
    "name": "EducaKids API",
    "description": "Coleção completa da API EducaKids",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Auth",
      "item": [
        {
          "name": "1. Request OTP",
          "request": {
            "method": "POST",
            "header": [{"key": "Content-Type", "value": "application/json"}],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"telefone\": \"+258840000000\"\n}"
            },
            "url": {
              "raw": "{{base_url}}/auth/request-otp",
              "host": ["{{base_url}}"],
              "path": ["auth", "request-otp"]
            }
          }
        },
        {
          "name": "2. Verify OTP & Login",
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "if (pm.response.code === 200) {",
                  "    var jsonData = pm.response.json();",
                  "    pm.environment.set('token', jsonData.data.token);",
                  "    pm.environment.set('user_id', jsonData.data.user.id);",
                  "}"
                ]
              }
            }
          ],
          "request": {
            "method": "POST",
            "header": [{"key": "Content-Type", "value": "application/json"}],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"telefone\": \"+258840000000\",\n  \"codigo\": \"123456\",\n  \"nome\": \"João Silva\"\n}"
            },
            "url": {
              "raw": "{{base_url}}/auth/verify-otp",
              "host": ["{{base_url}}"],
              "path": ["auth", "verify-otp"]
            }
          }
        },
        {
          "name": "3. Get Me",
          "request": {
            "method": "GET",
            "header": [{"key": "Authorization", "value": "Bearer {{token}}"}],
            "url": {
              "raw": "{{base_url}}/auth/me",
              "host": ["{{base_url}}"],
              "path": ["auth", "me"]
            }
          }
        },
        {
          "name": "4. Logout",
          "request": {
            "method": "POST",
            "header": [{"key": "Authorization", "value": "Bearer {{token}}"}],
            "url": {
              "raw": "{{base_url}}/auth/logout",
              "host": ["{{base_url}}"],
              "path": ["auth", "logout"]
            }
          }
        }
      ]
    },
    {
      "name": "Users",
      "item": [
        {
          "name": "Get Profile",
          "request": {
            "method": "GET",
            "header": [{"key": "Authorization", "value": "Bearer {{token}}"}],
            "url": {
              "raw": "{{base_url}}/users/profile",
              "host": ["{{base_url}}"],
              "path": ["users", "profile"]
            }
          }
        },
        {
          "name": "Update Profile",
          "request": {
            "method": "PUT",
            "header": [
              {"key": "Authorization", "value": "Bearer {{token}}"},
              {"key": "Content-Type", "value": "application/json"}
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"nome\": \"João Silva Atualizado\",\n  \"email\": \"joao@email.com\"\n}"
            },
            "url": {
              "raw": "{{base_url}}/users/profile",
              "host": ["{{base_url}}"],
              "path": ["users", "profile"]
            }
          }
        },
        {
          "name": "Become Gestor",
          "request": {
            "method": "POST",
            "header": [{"key": "Authorization", "value": "Bearer {{token}}"}],
            "url": {
              "raw": "{{base_url}}/users/become-gestor",
              "host": ["{{base_url}}"],
              "path": ["users", "become-gestor"]
            }
          }
        }
      ]
    },
    {
      "name": "Creches",
      "item": [
        {
          "name": "List Creches",
          "request": {
            "method": "GET",
            "url": {
              "raw": "{{base_url}}/creches?page=1&limit=10",
              "host": ["{{base_url}}"],
              "path": ["creches"],
              "query": [
                {"key": "page", "value": "1"},
                {"key": "limit", "value": "10"}
              ]
            }
          }
        },
        {
          "name": "Get Creche Details",
          "request": {
            "method": "GET",
            "url": {
              "raw": "{{base_url}}/creches/{{creche_id}}",
              "host": ["{{base_url}}"],
              "path": ["creches", "{{creche_id}}"]
            }
          }
        },
        {
          "name": "Create Creche",
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "if (pm.response.code === 201) {",
                  "    var jsonData = pm.response.json();",
                  "    pm.environment.set('creche_id', jsonData.data.id);",
                  "}"
                ]
              }
            }
          ],
          "request": {
            "method": "POST",
            "header": [
              {"key": "Authorization", "value": "Bearer {{token}}"},
              {"key": "Content-Type", "value": "application/json"}
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"nome\": \"Creche Sol Nascente\",\n  \"endereco\": \"Av. Julius Nyerere, 1234, Maputo\",\n  \"mensalidade\": 8500.00,\n  \"horario\": \"7h às 18h\",\n  \"descricao\": \"Creche com infraestrutura moderna\"\n}"
            },
            "url": {
              "raw": "{{base_url}}/creches",
              "host": ["{{base_url}}"],
              "path": ["creches"]
            }
          }
        },
        {
          "name": "Update Creche",
          "request": {
            "method": "PUT",
            "header": [
              {"key": "Authorization", "value": "Bearer {{token}}"},
              {"key": "Content-Type", "value": "application/json"}
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"mensalidade\": 9000.00\n}"
            },
            "url": {
              "raw": "{{base_url}}/creches/{{creche_id}}",
              "host": ["{{base_url}}"],
              "path": ["creches", "{{creche_id}}"]
            }
          }
        }
      ]
    },
    {
      "name": "Criancas",
      "item": [
        {
          "name": "List My Children",
          "request": {
            "method": "GET",
            "header": [{"key": "Authorization", "value": "Bearer {{token}}"}],
            "url": {
              "raw": "{{base_url}}/criancas",
              "host": ["{{base_url}}"],
              "path": ["criancas"]
            }
          }
        },
        {
          "name": "Create Child",
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "if (pm.response.code === 201) {",
                  "    var jsonData = pm.response.json();",
                  "    pm.environment.set('crianca_id', jsonData.data.id);",
                  "}"
                ]
              }
            }
          ],
          "request": {
            "method": "POST",
            "header": [
              {"key": "Authorization", "value": "Bearer {{token}}"},
              {"key": "Content-Type", "value": "application/json"}
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"nome\": \"Maria Silva\",\n  \"data_nascimento\": \"2020-05-15\"\n}"
            },
            "url": {
              "raw": "{{base_url}}/criancas",
              "host": ["{{base_url}}"],
              "path": ["criancas"]
            }
          }
        }
      ]
    },
    {
      "name": "Matriculas",
      "item": [
        {
          "name": "List My Enrollments",
          "request": {
            "method": "GET",
            "header": [{"key": "Authorization", "value": "Bearer {{token}}"}],
            "url": {
              "raw": "{{base_url}}/matriculas",
              "host": ["{{base_url}}"],
              "path": ["matriculas"]
            }
          }
        },
        {
          "name": "Create Enrollment",
          "request": {
            "method": "POST",
            "header": [
              {"key": "Authorization", "value": "Bearer {{token}}"},
              {"key": "Content-Type", "value": "application/json"}
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"creche_id\": {{creche_id}},\n  \"crianca_id\": {{crianca_id}}\n}"
            },
            "url": {
              "raw": "{{base_url}}/matriculas",
              "host": ["{{base_url}}"],
              "path": ["matriculas"]
            }
          }
        }
      ]
    },
    {
      "name": "Avaliacoes",
      "item": [
        {
          "name": "List Creche Reviews",
          "request": {
            "method": "GET",
            "url": {
              "raw": "{{base_url}}/avaliacoes/creche/{{creche_id}}",
              "host": ["{{base_url}}"],
              "path": ["avaliacoes", "creche", "{{creche_id}}"]
            }
          }
        },
        {
          "name": "Get Review Stats",
          "request": {
            "method": "GET",
            "url": {
              "raw": "{{base_url}}/avaliacoes/creche/{{creche_id}}/stats",
              "host": ["{{base_url}}"],
              "path": ["avaliacoes", "creche", "{{creche_id}}", "stats"]
            }
          }
        },
        {
          "name": "Create Review",
          "request": {
            "method": "POST",
            "header": [
              {"key": "Authorization", "value": "Bearer {{token}}"},
              {"key": "Content-Type", "value": "application/json"}
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"creche_id\": {{creche_id}},\n  \"estrelas\": 5,\n  \"comentario\": \"Excelente creche!\",\n  \"recomenda\": true\n}"
            },
            "url": {
              "raw": "{{base_url}}/avaliacoes",
              "host": ["{{base_url}}"],
              "path": ["avaliacoes"]
            }
          }
        }
      ]
    },
    {
      "name": "Admin",
      "item": [
        {
          "name": "Get Stats",
          "request": {
            "method": "GET",
            "header": [{"key": "Authorization", "value": "Bearer {{token}}"}],
            "url": {
              "raw": "{{base_url}}/admin/stats",
              "host": ["{{base_url}}"],
              "path": ["admin", "stats"]
            }
          }
        },
        {
          "name": "List All Users",
          "request": {
            "method": "GET",
            "header": [{"key": "Authorization", "value": "Bearer {{token}}"}],
            "url": {
              "raw": "{{base_url}}/admin/users",
              "host": ["{{base_url}}"],
              "path": ["admin", "users"]
            }
          }
        }
      ]
    },
    {
      "name": "Health Check",
      "request": {
        "method": "GET",
        "url": {
          "raw": "{{base_url}}/health",
          "host": ["{{base_url}}"],
          "path": ["health"]
        }
      }
    }
  ]
}
```

## 🎯 Fluxo de Teste Recomendado

### 1️⃣ Autenticação
1. **Request OTP** - Solicitar código
2. **Verify OTP & Login** - Fazer login (salva token automaticamente)
3. **Get Me** - Verificar usuário autenticado

### 2️⃣ Tornar-se Gestor
4. **Become Gestor** - Alterar tipo para gestor

### 3️⃣ Criar Creche
5. **Create Creche** - Cadastrar creche (salva ID automaticamente)
6. **List Creches** - Ver todas as creches
7. **Get Creche Details** - Ver detalhes da creche criada

### 4️⃣ Cadastrar Criança
8. **Create Child** - Cadastrar criança (salva ID automaticamente)
9. **List My Children** - Ver crianças cadastradas

### 5️⃣ Fazer Matrícula
10. **Create Enrollment** - Solicitar matrícula
11. **List My Enrollments** - Ver matrículas

### 6️⃣ Avaliar Creche
12. **Create Review** - Criar avaliação
13. **List Creche Reviews** - Ver avaliações
14. **Get Review Stats** - Ver estatísticas

### 7️⃣ Admin (se for admin)
15. **Get Stats** - Ver estatísticas gerais
16. **List All Users** - Ver todos os usuários

## 💡 Dicas

### Scripts Automáticos
As requisições de **Verify OTP & Login**, **Create Creche** e **Create Child** salvam automaticamente os IDs nas variáveis de ambiente para uso posterior.

### Testar como Admin
1. Crie um usuário admin no MySQL:
```sql
INSERT INTO users (nome, telefone, tipo) 
VALUES ('Admin', '+258800000000', 'admin');
```

2. Faça login com este telefone
3. Teste os endpoints de admin

### Múltiplos Usuários
Crie múltiplos ambientes no Postman para testar com diferentes usuários:
- "EducaKids - Pai"
- "EducaKids - Gestor"
- "EducaKids - Admin"

## 🐛 Troubleshooting

### Token expirado
Execute novamente "Request OTP" e "Verify OTP & Login"

### Variável não definida
Verifique se executou as requisições na ordem correta

### 401 Unauthorized
Verifique se o token está correto nas variáveis de ambiente

## 📚 Mais Informações

Consulte `API_EXAMPLES.md` para exemplos detalhados de todas as requisições.

---

Boa sorte com os testes! 🚀

