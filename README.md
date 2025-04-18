# 🏪 Physical Store Delivery API

API desenvolvida em **NestJS** com **TypeScript**, que retorna lojas e opções de entrega com base no CEP do cliente.

## 🚀 Tecnologias Utilizadas

- **TypeScript**
- **Node.js**
- **NestJS**
- **Dotenv**
- **Winston** (logger)
- **Swagger** (documentação)
- **Jest** (testes unitários)

> Aplicação baseada em princípios **SOLID**, com foco em **Clean Code**, cobertura de testes e documentação interativa via Swagger.

## 📦 Funcionalidades

- ✅ Listar todas as lojas cadastradas  
- 🔍 Buscar loja por ID  
- 🌎 Filtrar lojas por estado (UF)  
- 📍 Localizar lojas próximas de um CEP, com:
  - Cálculo de distância (via Google Maps API)
  - Entrega via PDV (motoboy até 50km - frete fixo)
  - Entrega via Correios (PAC ou SEDEX) para distâncias maiores

## 🔌 Principais Endpoints

| Método | Rota                       | Descrição                                 |
|--------|----------------------------|-------------------------------------------|
| GET    | `/stores`                  | Lista todas as lojas                      |
| GET    | `/store/:id`               | Retorna uma loja específica por ID        |
| GET    | `/stores/state/:uf`        | Filtra lojas por estado (UF)              |
| GET    | `/stores/:cep`             | Lista lojas próximas com opções de entrega|

## 🌐 Integrações Externas

- [ViaCEP](https://viacep.com.br/ws) — busca de endereço por CEP  
- [Google Maps Distance Matrix API](https://developers.google.com/maps/documentation/distance-matrix) — cálculo de distância entre CEPs  
- [Melhor Envio / Correios](https://www.melhorenvio.com.br/) — cálculo de frete e prazo via PAC/SEDEX

---

## 🛠️ Instalação e Execução Local

```bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/seu-repositorio.git

# 2. Acesse o diretório do projeto
cd seu-repositorio

# 3. Instale as dependências
npm install

# 4. Crie um arquivo .env com as variáveis necessárias
cp .env.example .env
```

### Variáveis esperadas no `.env`

```env
GOOGLE_API_KEY=sua_chave_google_maps
MELHORENVIO_TOKEN=seu_token_melhor_envio
BASE_URL=http://localhost:3000
```

### Para rodar o servidor em desenvolvimento:

```bash
npm run start:dev
```

---

## 🧪 Rodando os Testes

```bash
# Testes unitários
npm run test

# Cobertura de testes
npm run test:cov
```

---

## 📘 Documentação via Swagger

Após iniciar o projeto, acesse a documentação interativa no navegador:

```
http://localhost:3000/api
```

---

## 📬 Exemplos de Requisições

### Buscar lojas próximas de um CEP

```http
GET /stores/50050-030
```

**Resposta esperada:**
```json
{
  "tipoEntrega": "PDV",
  "valor": 15,
  "prazo": "2 dias úteis",
  "loja": {
    "storeID": "PDV001",
    "nome": "PDV Recife",
    "endereco": "Rua do Sol, Recife - PE"
  }
}
```

### Buscar frete via Correios

```http
GET /stores/99999-999
```

**Resposta esperada:**
```json
{
  "tipoEntrega": "Correios",
  "fretes": [
    {
      "servico": "PAC",
      "valor": 24.9,
      "prazo": "6 dias úteis"
    },
    {
      "servico": "SEDEX",
      "valor": 34.5,
      "prazo": "3 dias úteis"
    }
  ],
  "loja": {
    "storeID": "LOJA001",
    "nome": "Loja Online Recife",
    "associada": "PDV001"
  }
}
```

---

## 👨‍💻 Autor

Feito com 💻 por **Arthur Duarte**

📫 [aduarte98@outlook.com](mailto:aduarte98@outlook.com)  
🔗 [github.com/aduarte98](https://github.com/aduarte98)
