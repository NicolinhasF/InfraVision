# Tela de Servidores

A listagem consome `GET /api/servidores` usando o Axios configurado em `src/services/api.js`.

A URL-base pode ser definida em `.env`:

```env
REACT_APP_API_URL=http://localhost:3002/api
```

Use a mesma porta configurada em `Back-End/.env` na variável `PORT`. Reinicie o
servidor do front-end depois de alterar essa URL.

A página de detalhes usa:

- `GET /api/componentes` para localizar o componente pelo ID;
- `GET /api/metricas?componente_id=ID` para montar os gráficos com medições registradas;
- `GET /api/analises?componente_id=ID` para exibir análises relacionadas.

Os gráficos não fabricam histórico. Com apenas uma medição, a tela mostra o ponto disponível e informa que mais coletas são necessárias para formar uma série histórica.
