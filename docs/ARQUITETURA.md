# Diretrizes de Arquitetura do Projeto

Este documento define a arquitetura, a organização de pastas e as convenções que **devem ser seguidas em qualquer desenvolvimento** feito neste repositório — manual ou assistido por IA. O objetivo é manter consistência entre módulos, evitar duplicação de lógica (especialmente de validação) e facilitar a manutenção do sistema conforme ele cresce.

Sempre que um novo código for gerado (por uma pessoa ou por uma IA), ele deve respeitar as pastas, camadas e responsabilidades descritas aqui. Se uma tarefa não se encaixar claramente em nenhuma categoria, prefira criar a estrutura mais próxima do padrão já existente em vez de inventar uma nova organização.

---

## 1. Visão geral do monorepo

```
/
├── apps/
│   ├── api/      -> Back-end (Node.js + Express + Prisma + MySQL)
│   └── web/      -> Front-end (React + Vite)
└── packages/
    └── shared/   -> Código compartilhado entre api e web (schemas Zod, tipos, constantes)
```

- **`apps/api`**: toda a lógica de servidor, regras de negócio, acesso ao banco de dados e exposição de rotas HTTP.
- **`apps/web`**: toda a interface do usuário, componentes visuais e chamadas à API.
- **`packages/shared`**: código que **não pertence exclusivamente** ao front ou ao back e que seria duplicado se não fosse centralizado. Principal uso: schemas de validação Zod e os tipos TypeScript inferidos a partir deles.

**Regra de ouro:** se uma regra de validação (formato de e-mail, tamanho mínimo de senha, campos obrigatórios de um grupo, etc.) é usada tanto no front quanto no back, ela deve existir **uma única vez**, em `packages/shared`, e ser importada pelos dois lados. Nunca reescrever a mesma validação em `apps/web` e em `apps/api`.

---

## 2. `packages/shared`

```
packages/shared/
└── src/
    ├── schemas/
    │   ├── auth.schema.ts
    │   ├── usuario.schema.ts
    │   ├── grupo.schema.ts
    │   ├── registro.schema.ts
    │   └── hobby.schema.ts
    ├── types/
    │   └── index.ts        -> tipos utilitários que não vêm de um schema Zod
    └── index.ts             -> barrel export (re-exporta tudo)
```

Convenções:

- Cada schema Zod fica em um arquivo próprio, nomeado a partir da entidade que ele valida (`usuario.schema.ts`, `grupo.schema.ts`, etc.), seguindo as classes do diagrama de classes (Usuário, Grupo, Registro, Hobby).
- O tipo TypeScript de cada entidade deve ser **inferido do schema**, nunca escrito manualmente em paralelo:
  ```ts
  export const criarGrupoSchema = z.object({ ... });
  export type CriarGrupoInput = z.infer<typeof criarGrupoSchema>;
  ```
- Tudo que for reaproveitável deve ser exportado pelo `index.ts` da raiz do pacote, para que `apps/api` e `apps/web` importem sempre do pacote (`shared`), nunca de um caminho relativo profundo (`../../../packages/shared/src/schemas/...`).
- Além dos schemas Zod, `packages/shared` também é o lugar correto para constantes usadas nos dois lados (ex.: lista de prioridades, enums de status de convite), caso surjam.

---

## 3. `apps/api` — Back-end

```
apps/api/
├── prisma/
│   └── schema.prisma        -> definição do modelo de dados (infra do banco)
└── src/
    ├── modules/
    │   ├── auth/
    │   │   ├── auth.routes.ts
    │   │   ├── auth.controller.ts
    │   │   ├── auth.service.ts
    │   │   └── auth.repository.ts
    │   ├── usuarios/
    │   ├── grupos/
    │   ├── hobbies/
    │   ├── registros/
    │   └── gamificacao/
    ├── middlewares/
    │   ├── auth.middleware.ts
    │   ├── validate.middleware.ts
    │   ├── upload.middleware.ts
    │   └── error.middleware.ts
    ├── services/                -> services transversais, não presos a um único módulo
    │   └── upload.service.ts
    ├── clients/
    │   └── prisma.client.ts     -> instância única (singleton) do PrismaClient
    ├── infra/
    │   └── env.ts               -> leitura/validação de variáveis de ambiente
    ├── routes/
    │   └── index.ts             -> agrega as rotas de todos os módulos
    ├── app.ts                    -> configuração do Express (middlewares globais, rotas)
    └── server.ts                 -> ponto de entrada, inicializa o servidor HTTP
```

### 3.1 Módulos (`src/modules/<nome>`)

Cada módulo representa um domínio do sistema (alinhado às classes do diagrama e aos casos de uso: Conta, Grupo, Registro de Hobby, Gamificação) e **sempre** contém as mesmas quatro camadas:

| Camada | Arquivo | Responsabilidade |
|---|---|---|
| Routes | `*.routes.ts` | Declara os endpoints HTTP do módulo e liga cada rota ao middleware de validação (Zod), ao middleware de autenticação (quando necessário) e ao controller correspondente. **Não contém lógica.** |
| Controller | `*.controller.ts` | Recebe a requisição já validada, extrai os dados necessários, chama o service correspondente e devolve a resposta HTTP (status code + JSON). **Não contém regra de negócio nem acesso direto ao banco.** |
| Service | `*.service.ts` | Contém a regra de negócio do módulo (ex.: calcular pontuação, validar se o hobby está liberado no grupo, gerar código de convite). Chama um ou mais repositories. Pode chamar services de outros módulos quando uma regra depende de outro domínio. |
| Repository | `*.repository.ts` | Única camada que acessa o banco de dados, sempre através do Prisma Client importado de `clients/prisma.client.ts`. Não contém regra de negócio, apenas consultas e escrita de dados. |

Fluxo de uma requisição: **Route → Middleware(s) → Controller → Service → Repository → Banco de dados**, e a resposta percorre o caminho inverso.

Módulos previstos inicialmente (poderão ser ajustados conforme o desenvolvimento avança):

- **auth**: cadastro e login (RF1, RF2).
- **usuarios**: dados de perfil do usuário autenticado.
- **grupos**: criação, entrada, convite/compartilhamento, configuração do desafio e ranking (RF3, RF4, RF5, RF6, RF12, RF13).
- **hobbies**: catálogo de hobbies e hobbies permitidos por grupo (RF8).
- **registros**: registro de atividades, histórico e foto (RF9, RF10, RF11).
- **gamificacao**: cálculo de pontuação e conquistas (RF7, RF14).

### 3.2 Middlewares (`src/middlewares`)

Middlewares são sempre globais ou reaproveitáveis entre módulos e nunca ficam dentro da pasta de um módulo específico. Exemplos previstos: autenticação (JWT), validação de schema Zod, upload de arquivos (Multer) e tratamento centralizado de erros.

### 3.3 Services transversais (`src/services`)

Diferente do `*.service.ts` de um módulo (que contém regra de negócio daquele domínio), a pasta `src/services` guarda serviços que **não pertencem a um módulo específico** e podem ser usados por vários módulos — por exemplo, um serviço de upload/armazenamento de arquivos usado tanto por `registros` (foto da atividade) quanto por `usuarios` (foto de perfil).

### 3.4 Clients (`src/clients`)

Ponto único de instância de qualquer cliente externo usado pela aplicação — atualmente, o Prisma Client (conexão com o MySQL). Nenhum outro arquivo deve instanciar o `PrismaClient` diretamente; todos importam a instância única a partir daqui. Novos clients (ex.: um client de armazenamento em nuvem, caso o projeto evolua para isso) também entram nesta pasta.

### 3.5 Infra (`src/infra` + `prisma/`)

Tudo relacionado à infraestrutura do banco de dados e ao ambiente de execução:

- `prisma/schema.prisma`: modelo de dados, espelhando as classes do diagrama (Usuário, Grupo, Registro, Hobby) e seus relacionamentos.
- `src/infra/env.ts`: leitura e validação (com Zod) das variáveis de ambiente (string de conexão do banco, segredo do JWT, limites de upload, etc.), para que nenhuma variável de ambiente seja lida diretamente com `process.env` espalhada pelo código.

---

## 4. `apps/web` — Front-end

```
apps/web/
└── src/
    ├── components/
    │   ├── common/           -> componentes genéricos (Button, Input, Modal, Avatar...)
    │   └── <dominio>/        -> componentes específicos de um domínio (ex.: RankingList, GroupCard)
    ├── pages/
    │   ├── Login/
    │   ├── Cadastro/
    │   ├── Grupos/
    │   ├── GrupoDetalhes/
    │   ├── RegistrarAtividade/
    │   └── Perfil/
    ├── services/              -> chamadas à API, organizadas por domínio
    │   ├── auth.service.ts
    │   ├── grupos.service.ts
    │   ├── registros.service.ts
    │   └── http.ts            -> instância única do client HTTP (ex.: axios/fetch configurado)
    ├── hooks/                 -> hooks customizados, incluindo os hooks do TanStack Query
    │   ├── useAuth.ts
    │   └── useGrupos.ts
    ├── routes/
    │   └── router.tsx         -> configuração do React Router DOM
    └── App.tsx
```

Convenções:

- **Componentes** ficam em `components/`, são pequenos, reutilizáveis e **não fazem chamadas diretas à API** nem centralizam regra de página — recebem dados e callbacks via props.
- **Páginas** (`pages/`) representam uma rota da aplicação e são responsáveis por **compor** componentes individuais, orquestrar hooks (dados, formulário) e decidir o que é exibido em cada estado (carregando, erro, sucesso). Uma página importa componentes de `components/`; o inverso nunca acontece.
- **Services do front** (`services/`) concentram as chamadas HTTP para a API, uma por domínio, e são a única camada que sabe o endereço e o formato das rotas do back-end. Componentes e páginas nunca chamam `fetch`/`axios` diretamente — sempre passam por um service ou por um hook que usa um service.
- **Hooks** (`hooks/`) encapsulam o uso do TanStack Query (`useQuery`/`useMutation`) sobre os services, para que páginas e componentes consumam dados prontos (`data`, `isLoading`, `error`) sem lidar com cache ou revalidação diretamente.
- Toda validação de formulário no front deve reutilizar os schemas Zod de `packages/shared`, nunca redefinir regras já existentes no back-end.

---

## 5. Regras gerais para qualquer desenvolvimento (inclusive por IA)

1. **Nunca duplicar validação.** Se já existe um schema Zod em `packages/shared` para a entidade em questão, reutilize-o; se não existir, crie-o lá antes de usá-lo em qualquer lado.
2. **Respeitar a camada.** Controller não acessa o banco; repository não contém regra de negócio; rota não contém lógica; componente de front não chama a API diretamente.
3. **Um módulo novo no back-end sempre nasce com as quatro camadas** (`routes`, `controller`, `service`, `repository`), mesmo que alguma comece simples.
4. **Nada de instância solta do Prisma Client.** Sempre importar de `src/clients/prisma.client.ts`.
5. **Middlewares e services transversais não entram dentro de um módulo.** Se o código é usado por mais de um módulo, ele vai para `src/middlewares` ou `src/services`, conforme a natureza (middleware intercepta requisição; service transversal executa uma tarefa reaproveitável).
6. **Nomenclatura consistente:** arquivos em `kebab-case` ou `camelCase.tipo.ts` (ex.: `grupo.service.ts`), pastas de módulo e de página em `PascalCase`/nome do domínio no singular ou plural conforme já padronizado no restante do projeto.
7. **Toda nova rota** deve ser documentada no plano de rotas (planilha de acompanhamento do projeto) antes ou junto da implementação.
8. **Mobile first sempre.** Qualquer componente ou página nova no `apps/web` deve ser pensada primeiro para a tela de um dispositivo móvel e depois adaptada para telas maiores.
