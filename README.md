# 🏪 Physical Store Delivery API

API desenvolvida em **NestJS** com **TypeScript** que retorna lojas e opções de entrega baseadas no CEP do cliente.

## 🚀 Tecnologias utilizadas

- TypeScript
- Node.js
- NestJS
- dotenv
- winston
- Swagger (documentação)
- Jest (testes unitários)

Extras aplicados: SOLID, Clean Code, testes unitários e documentação via Swagger.

## 📦 Funcionalidades principais

- **Listar todas as lojas** cadastradas
- **Buscar loja por ID**
- **Filtrar lojas por estado (UF)**
- **Buscar lojas próximas de um CEP**, com:
  - Cálculo de distância (via Google Maps)
  - Entrega por PDV (Motoboy até 50km)
  - Entrega via Correios (PAC/Sedex) para distâncias maiores

## 🛠️ Endpoints principais

- `GET /stores` — lista todas as lojas
- `GET /store/:id` — retorna uma loja por ID
- `GET /stores/state/:uf` — filtra lojas por estado
- `GET /stores/:cep` — retorna lojas próximas ao CEP com opções de entrega

## 🌐 APIs externas utilizadas

- [ViaCEP](http://viacep.com.br/ws)
- [Google Maps Distance Matrix](https://maps.googleapis.com/maps/api)
- [Correios Preço e Prazo](https://www.correios.com.br/@@precosEPrazosView)
