# Integração da tela de servidores

## 1. Preparar a coluna IP

No phpMyAdmin, selecione o banco `infravision` e execute o arquivo `migration_ip_componentes.sql`.

O arquivo cria a coluna `ip` em `componente_infraestrutura` se ela ainda não existir e preenche endereços privados fictícios para os seis componentes de demonstração (cinco servidores e um roteador). Substitua esses IPs pelos endereços corretos do ambiente quando necessário.

## 2. Rota da listagem

`GET /api/servidores`

Retorna somente componentes com `tipo = 'servidor'`, junto com a medição mais recente de cada componente. Campos de métricas sem medição são retornados como `null`.

## 3. Rotas utilizadas na tela de detalhes

- `GET /api/componentes` — identificação, IP, tipo e status do componente.
- `GET /api/metricas?componente_id=ID` — medições registradas para o servidor.
- `GET /api/analises?componente_id=ID` — análises registradas para o servidor.

O endpoint `POST /api/chat` e a integração Groq não foram alterados.
