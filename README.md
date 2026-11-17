# Hobyn — desenvolvimento local

MySQL 8.4 no Docker; API e React no Node do computador, com atualização ao editar o código.
O banco mantém os dados em volume persistente.

## Requisitos

- Node.js 24 com Corepack (`node --version` e `corepack --version`).
- Docker Desktop iniciado com motor Linux (`docker info`).
- Execute os comandos na raiz do repositório.
- Se o Docker acabou de ser instalado, abra um novo terminal para atualizar o PATH.

## Primeiro uso

```powershell
node scripts/setup-local.mjs
corepack pnpm install --frozen-lockfile
corepack pnpm db:up
corepack pnpm db:setup
corepack pnpm dev
```

O setup cria `.env` na raiz e em `apps/api`, gera uma chave JWT aleatória e preserva
arquivos existentes. Os arquivos reais são ignorados pelo Git. A instalação usa a
versão de pnpm fixada no projeto, sem exigir instalação global.

| Serviço | Endereço |
| --- | --- |
| Web | http://localhost:5173 |
| API | http://localhost:3030/api |
| MySQL | 127.0.0.1:3307 |

A porta 3307 evita conflito com o serviço que já ocupa a 3306 nesta máquina.
Banco e usuário locais se chamam `hobyn`. As senhas de desenvolvimento estão nos
exemplos de ambiente. Para mudar a conexão, ajuste `.env` na raiz e `DATABASE_URL`
em `apps/api/.env`. Mudar variáveis do Compose depois que o volume foi inicializado
não altera usuários/senhas já gravados no MySQL.

## Uso diário

```powershell
corepack pnpm db:up
corepack pnpm dev
```

Ctrl+C encerra API e web. Para parar apenas o banco, preservando os dados:

```powershell
corepack pnpm db:stop
```

Para iniciar API e web separadamente, use `corepack pnpm dev:api` e
`corepack pnpm dev:web` em dois terminais.

## Banco, migrations e seed

`db:setup` gera o Prisma Client, aplica migrations pendentes com `migrate deploy`
e executa o seed. Pode ser repetido: não apaga dados nem sobrescreve regras existentes.
A migration inicial representa o schema que já existia no projeto. Ela é destinada
a banco novo; um banco existente sem histórico Prisma precisa de baseline antes de
receber essas migrations. Não use reset para migrar dados existentes.

O seed contém os cinco hobbies já usados pela interface (incluindo Outro), 5 pontos
por registro e 2 pontos por bloco de 30 minutos. São configurações iniciais de
desenvolvimento baseadas no exemplo do modelo de dados.
`BONUS_COOPERATIVO_MULTIPLICADOR=1.2` cria a regra cooperativa se ela não existir.
Alterar a variável depois não modifica uma regra já persistida.
O seed não cria contas nem implementa convites, upload ou ranking.

```powershell
corepack pnpm --filter api db:status
corepack pnpm --filter api exec prisma validate
```

Para mudanças futuras do schema, crie uma nova migration de desenvolvimento;
não edite migrations já aplicadas. O usuário comum do banco não recebe privilégios
globais para criar shadow databases.

## Verificações

```powershell
corepack pnpm test
corepack pnpm build
corepack pnpm lint
```

Os testes atuais da API são unitários com repositories simulados; não comprovam
integração HTTP com MySQL. O lint atual cobre JS/JSX; cobertura de TS/TSX e checagem
de tipos continuam pendentes. O frontend ainda usa mocks e os formulários ainda
não persistem pela API. Subir este ambiente não conclui a integração funcional.

## Docker e mudança de ambiente

O container mantém o MySQL na porta interna 3306 e publica apenas em 127.0.0.1:3307.
API e web rodam no host. Se a API for colocada em um container futuramente,
a conexão passa a usar `mysql:3306` em vez de `127.0.0.1:3307`.
Em outro ambiente local, ajuste conexão, origem web e chave JWT. A migração de
dados é separada da configuração de ambiente. As credenciais fornecidas são
exclusivas para desenvolvimento local.
