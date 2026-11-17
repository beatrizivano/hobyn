# Ranking dos grupos

O ranking é calculado em tempo real a partir de `logAtividades`; não existe uma
tabela de totais que possa ficar dessincronizada. O endpoint soma
`pontosGanhos` por usuário e grupo e retorna todos os membros ativos, inclusive
quem ainda tem zero ponto.

## Contrato HTTP

`GET /api/groups/:groupId/ranking`

- exige sessão e associação ativa ao grupo;
- responde `404` para não membros e grupos excluídos, sem revelar sua existência;
- continua disponível para leitura quando o grupo está encerrado;
- omite contas excluídas e associações com `saiuEm` preenchido.

Cada item contém `usuario`, `pontuacao` e `colocacao`. A ordem principal é a
pontuação decrescente. Empates compartilham a colocação no formato competitivo
(`1, 1, 3`); nome e ID são usados apenas para manter uma ordem visual estável
entre pessoas empatadas.

A aba Ranking da página do grupo consulta esse endpoint somente quando aberta,
destaca a pessoa autenticada e identifica as três primeiras colocações.

## Verificação

```powershell
corepack pnpm test
corepack pnpm test:rankings
corepack pnpm typecheck
corepack pnpm lint
corepack pnpm build
```

O teste de integração usa servidor e contas temporários no MySQL local. Ele cobre
soma de vários logs, empate, membro sem pontos, ex-membro, acesso externo e grupo
encerrado. O módulo não exige migration: utiliza os logs e associações existentes.
