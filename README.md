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

O setup cria `.env` na raiz, em `apps/api` e em `apps/web`, gera uma chave JWT aleatória e preserva
arquivos existentes. Os arquivos reais são ignorados pelo Git. A instalação usa a
versão de pnpm fixada no projeto, sem exigir instalação global.

| Serviço | Endereço |
| --- | --- |
| Web | http://localhost:5174 |
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
O seed não cria contas nem dados de convites, upload ou ranking.

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
corepack pnpm typecheck
```

`test` executa os testes unitários da API e do cliente HTTP da web,
incluindo refresh simultâneo, expiração, falha de rede e encerramento de sessão.
`typecheck` verifica os arquivos TS/TSX. O lint atual cobre JS/JSX.

Para validar convites com o MySQL local ligado:

```powershell
corepack pnpm test:invites
```

O teste cobre emissão, permissões, renovação, expiração e entrada concorrente.
O contrato completo está em [Convites de grupo](docs/CONVITES.md).

Para validar o middleware de sessão com o MySQL local ligado:

```powershell
corepack pnpm test:session
```

Esse teste cria seu próprio servidor HTTP temporário em uma porta livre. Confere
revogação imediata após logout, independência entre logins, sessão vencida,
associação entre sessão e usuário e exclusão de conta. As contas de teste são
excluídas logicamente ao finalizar.

Com API e Vite iniciados, execute também:

```powershell
corepack pnpm test:integration
```

Esse smoke usa os services reais da web através do proxy Vite e do MySQL.
Cria duas contas e um grupo temporários, confere contratos e permissões,
restaura a sessão por cookie, testa refresh e edição de perfil e limpa as fixtures
pelos endpoints. As exclusões lógicas e os logs históricos são preservados pelas
regras da aplicação. O teste só aceita destinos locais e usa um cookie jar de teste;
não substitui E2E em navegador. O fluxo de registros usa arquivo real via multipart,
leitura autenticada da foto, edição e exclusão.

## Integração web e API

O cliente web usa `VITE_API_BASE_URL=/api`; em desenvolvimento o Vite encaminha
as chamadas para `API_PROXY_TARGET` (padrão `http://127.0.0.1:3030`). Assim, web e
cookie de refresh ficam na mesma origem. O access token fica em memória; o cookie
HttpOnly restaura a sessão após reload. Rotas privadas exigem uma sessão válida.
API e web reutilizam os schemas do pacote local `shared` via `workspace:*`.

O JWT inclui o identificador da sessão (`sid`). Em cada rota privada, o middleware
confere que a sessão pertence ao usuário do token, não foi revogada e ainda não
venceu, e que a conta continua ativa. Logout revoga os access tokens daquela
sessão imediatamente; outros logins do mesmo usuário permanecem válidos.
Tokens antigos sem `sid` são rejeitados; um refresh válido emite o novo formato.
Essa mudança reutiliza a tabela de sessões existente, sem nova migration.

Melhorias opcionais de autenticação estão em
[Melhorias pós-MVP](docs/MELHORIAS_POS_MVP.md).


Já conectados: cadastro, login, `/me`, refresh, logout, exclusão de conta,
edição de nome/sobrenome, listagem/criação/detalhe/configuração de grupos,
emissão e entrada por convite, catálogo de hobbies, criação multipart, feed paginado, detalhe, edição e exclusão
dos registros, com leitura privada das fotos.
As mutações de grupos invalidam o cache; logout e troca de identidade limpam
os dados privados das queries. Não são usados dados dos mocks nas telas integradas.

Ainda pendentes para fechar o fluxo do MVP:

- Envio de fotos de perfil/grupo; o upload de fotos dos registros já está implementado.
- Consulta de ranking e sua integração na web.
- Testes E2E no navegador com dois usuários, responsividade e falhas de rede reais.

Conquistas, desafios e estatísticas avançadas continuam fora deste recorte.
As telas sem endpoint mostram indisponibilidade, em vez de dados simulados ou
sucesso sem persistência.

Para publicar o build, configure um reverse proxy para `/api` ou informe a URL
pública da API em `VITE_API_BASE_URL` no momento do build e ajuste CORS/cookies.
Variáveis `VITE_*` são públicas e não devem conter segredos.

## Fotos dos registros

JPEG, PNG e WebP de até 10 MiB são processados e armazenados em
`apps/api/storage/uploads`. O diretório é persistente e ignorado pelo Git;
a variável opcional `UPLOAD_DIR` permite mudar seu local. Faça backup desse
diretório junto com o banco. Não é necessária nova migration.

Com o MySQL ligado, valide o módulo independentemente dos servidores de dev:

```powershell
corepack pnpm test:records
```

O contrato HTTP, as permissões e os cenários cobertos estão em
[Upload e registros](docs/UPLOAD_E_REGISTROS.md).

## Docker e mudança de ambiente

O container mantém o MySQL na porta interna 3306 e publica apenas em 127.0.0.1:3307.
API e web rodam no host. Se a API for colocada em um container futuramente,
a conexão passa a usar `mysql:3306` em vez de `127.0.0.1:3307`.
Em outro ambiente local, ajuste conexão, origem web e chave JWT. A migração de
dados é separada da configuração de ambiente. As credenciais fornecidas são
exclusivas para desenvolvimento local.
