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

## 4. Recomendações e configurações

Para a geração de recomendações, foi aplicada no banco `infravision` a migration:

`migration_recomendacoes.sql` adiciona os campos estruturados e uma chave única para
impedir recomendações idênticas duplicadas. Ela não remove nem altera os registros
de análises que já existiam.

As configurações de monitoramento são globais e usam a tabela
`configuracoes_sistema` com um único registro `id = 1`, sem exigir login. A tela
converte os limiares `alerta_cpu`, `alerta_ram` e `alerta_disco` da tabela em switches:
zero desativa o alerta; um valor positivo o habilita e define o limiar.

As rotas adicionadas são:

- `GET /api/recomendacoes` — lista recomendações salvas.
- `POST /api/recomendacoes/gerar` — consulta métricas e análises e solicita recomendações à Groq.
- `GET /api/alertas` — compara as últimas métricas dos servidores com os limites configurados.
- `GET /api/configuracoes` — busca as preferências globais do sistema.
- `PUT /api/configuracoes` — valida e salva as preferências globais do sistema.

A atualização automática configurada controla as consultas periódicas das telas de
servidores, infraestrutura, análises, custos, detalhes e recomendações. Ela não
inicia coleta de métricas nos servidores. A tela de previsões atualiza a consulta aos
dados já salvos, sem gerar previsões novas automaticamente; a tela de perfil não é
atualizada periodicamente.

O aviso temporário de cada novo alerta aparece por 8 segundos e depois fica registrado
no sininho da interface. Abrir o sininho marca as notificações como lidas; elas ficam
salvas no navegador até serem removidas. Alertas que deixam de ultrapassar o limite
ficam marcados como resolvidos. Um limite ultrapassado de novo gera uma nova
notificação. Valores a partir de 95% são críticos e podem ser ocultados pelo switch
`alertas_criticos`.

## 5. Dashboard

`GET /api/dashboard` consolida em uma única resposta os indicadores da página:

- total de servidores e médias de CPU/RAM calculadas a partir da última métrica de cada servidor;
- custos mais recentes por componente, normalizados para um período de 30 dias;
- até 24 horários mais recentes de métricas, agregados entre os servidores;
- contagens de status usando os limites configurados e 95% como corte crítico;
- até cinco alertas derivados das últimas métricas e dos limites de alertas ativos;
- a previsão futura mais relevante salva para CPU, RAM ou disco.

A economia potencial aparece como não estimada quando as recomendações salvas não
informam um valor financeiro. O endpoint não cria valores artificiais nem altera
as tabelas existentes. Se um indicador não tiver registros, ele é retornado como
`null` ou lista vazia, conforme o campo.
