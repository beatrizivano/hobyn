# Convites de grupo

O MVP implementa entrada por código compartilhável. Cada grupo mantém no máximo
um código atual de 16 caracteres, com 80 bits de aleatoriedade e validade de sete
dias. Se o grupo encerrar antes, o convite deixa de valer no encerramento.

Somente o administrador ativo de um grupo aberto pode consultar ou gerar o código.
Gerar outro substitui e invalida o anterior. O código não aparece nas respostas
comuns de grupo; ele é retornado apenas pelos endpoints administrativos.

## Contrato HTTP

| Método | Rota | Resultado |
| --- | --- | --- |
| `GET` | `/api/groups/:groupId/invite` | convite atual ou `null`, apenas para o admin |
| `POST` | `/api/groups/:groupId/invite` | cria ou renova o convite, apenas para o admin |
| `POST` | `/api/invites/join` | entra com `{ "codigo": "..." }` |

A entrada nova responde `201`; uma conta que já é membro recebe `200` e não cria
outra associação. Ao retornar depois de uma saída, é criada uma nova associação
com papel `membro`: um papel administrativo antigo nunca é restaurado pelo código.
Convite inexistente responde `404`; expirado, grupo encerrado ou excluído responde
`410`. As escritas usam transação serializável com repetição de conflitos.

A web permite gerar, renovar e copiar código ou link na página do grupo. A página
`/grupos/entrar` aceita o código formatado com espaços/hífens. O destino completo é
preservado quando a pessoa precisa passar por login ou cadastro.

## Verificação

```powershell
corepack pnpm test
corepack pnpm test:invites
corepack pnpm typecheck
corepack pnpm lint
corepack pnpm build
```

`test:invites` usa servidor e contas temporários no MySQL local e cobre permissões,
renovação, expiração, normalização, repetição e duas entradas concorrentes.
Convites diretos por e-mail/notificação não fazem parte deste recorte do MVP.
