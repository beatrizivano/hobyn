# Design System — Hobyn

Neobrutalismo suave, retrô e funcional. Este documento é a referência de **como o app deve parecer e se comportar**. Ele complementa `ARQUITETURA.md` (onde o código mora), `MODELO_DE_DADOS.md` (o que os campos significam) e `REGRAS_DE_NEGÓCIO.md` (o que o sistema faz).

Toda decisão visual está implementada em `apps/web/src/styles/tokens.css`. **Nenhum componente declara cor, raio, sombra ou fonte literal**: sempre usa uma variável de lá.

---

## 1. Princípios

1. **Útil antes de bonito.** O app serve para registrar um hobby em poucos toques e voltar a viver fora da tela. O fluxo principal (abrir → `+` → salvar registro) nunca passa de três telas.
2. **Respeitar a atenção.** Sem dark patterns: nada de streak visível com contagem de risco, nada de notificação de culpa, nada de scroll infinito, nada de contador de urgência. Ver seção 10.
3. **Neobrutalismo suave.** Bordas firmes, sombra sólida deslocada, cantos de no máximo 8px. A suavidade vem dos círculos (avatares, ícones, badges) e dos cantos curtos, nunca de blur ou gradiente.
4. **Retrô com propósito.** Fundo pontilhado de Game Boy, fotos com dither e pixel art nas badges. Textura aparece onde diz algo (o desafio da semana, a foto ainda sem imagem, a conquista), não como decoração solta.
5. **Cor só com função.** Cinza e tinta carregam o app. O verde e o coral aparecem apenas em tags de hobby. O erro usa borda coral **mais** ícone e texto, nunca só cor.
6. **Mobile first.** Todo componente nasce para 360px de largura e só depois ganha ajustes para telas maiores.

---

## 2. Tokens

### 2.1 Cores

Cinco famílias: cinza claro, tinta (`#3D3D3D`), preto de sombra, verde e coral.

| Token | Valor | Uso |
|---|---|---|
| `--color-paper` | `#E6E6E3` | Fundo das telas |
| `--color-surface` | `#F6F6F4` | Cards e blocos |
| `--color-white` | `#FFFFFF` | Botões, campos, tags neutras, badge conquistada |
| `--color-ink` | `#3D3D3D` | Texto, bordas, botão primário, aba ativa, card escuro |
| `--color-ink-soft` | `#5A5A57` | Texto secundário (tom da tinta) |
| `--color-shadow` | `#000000` | **Somente** sombras sólidas |
| `--color-green` | `#8FD6A4` | Tag de hobby |
| `--color-coral` | `#F28B76` | Tag de hobby; borda de erro |
| `--color-avatar` | `#C9C9C5` | Avatares e silhuetas |
| `--color-dither` / `--color-dot` | `#B5B5B1` / `#B8B8B4` | Pontos de dither e do fundo pontilhado |
| `--color-locked` | `#A5A5A0` | Pixel art de badge ainda não conquistada |

Contrastes (WCAG): tinta sobre papel 8,7:1; tinta sobre card 10,0:1; texto secundário sobre papel 5,5:1; branco sobre tinta 10,9:1; tinta sobre verde 6,4:1; tinta sobre coral 4,5:1 (limite do AA, por isso o texto das tags é sempre negrito).

### 2.2 Tipografia

Duas famílias, bem distintas:

| Papel | Família | Onde |
|---|---|---|
| Destaque | **Archivo Black** (`--font-display`) | Títulos de tela, saudação, números, pontuação, wordmark |
| Geral | **Karla** 400/500/700 (`--font-body`) | Texto corrido, rótulos, botões, campos |

| Token | Tamanho | Uso típico |
|---|---|---|
| `--text-xs` | 12px | Tags, legendas de estatística |
| `--text-sm` | 14px | Dicas, metadados, rótulos de campo |
| `--text-md` | 16px | Texto base e campos (evita zoom automático no iOS) |
| `--text-lg` | 20px | Títulos de card, números de destaque |
| `--text-xl` | 24px | Título de tela |
| `--text-2xl` | 32px | Nome na home, pontuação total |

Títulos usam `--leading-tight` (1.15) e `--tracking-display` (-0.01em). Texto corrido usa `--leading-body` (1.45) e linhas curtas (a coluna tem no máximo 30rem). Títulos em frase normal, sem caixa alta.

### 2.3 Espaço, forma e profundidade

| Token | Valor | Observação |
|---|---|---|
| `--space-1 … --space-7` | 4, 8, 12, 16, 24, 32, 48 px | Escala única de espaçamento |
| `--radius-xs / sm / md` | 4 / 6 / 8 px | Barra de progresso / tags e fotos / cards, botões e campos |
| `--radius-full` | 999px | **Só** avatares, botões de ícone e badges |
| `--border` | 1,5px sólida `--color-ink` | Borda padrão; `--border-dashed` para estados vazios e badges bloqueadas |
| `--shadow` | 4px 4px 0 preto | Cards, botões, botões de ícone |
| `--shadow-sm` | 3px 3px 0 preto | Campos, estatísticas, itens de lista |
| `--shadow-pressed` | 1px 1px 0 preto | Estado pressionado |

Interação: ao pressionar, o elemento desloca (3px, 3px) e a sombra encolhe para `--shadow-pressed`. Esse é o único movimento de interface; ele responde a uma ação do usuário e some com `prefers-reduced-motion`.

### 2.4 Texturas

| Token | Efeito | Onde |
|---|---|---|
| `--texture-dots` + `--texture-dots-size` | Pontilhado de 6px | Fundo da página (fora da coluna), card do desafio da semana |
| `--texture-dither` + `--texture-dither-size` | Xadrez de 4px | Foto ainda sem imagem (`PhotoFrame`) |

Ambas são CSS puro (`radial-gradient` e `repeating-conic-gradient`), sem imagens.

### 2.5 Pixel art

As badges usam sprites 8×8 desenhados com **um único elemento e `box-shadow`** (`PixelSprite`). Cada pixel é uma sombra deslocada em múltiplos de `--px`; a cor vem de `currentColor`.

- Conquistada: sprite em tinta, dentro de círculo branco com borda e sombra.
- Bloqueada: sprite em `--color-locked`, dentro de círculo tracejado, sem sombra.
- Os 12 sprites (coroa, alvo, chama, brilho, chapéu de chef, halter, livro, pincel, coração, troféu, pódio, ampulheta) ficam em `modules/gamificacao/data/sprites.ts`.

---

## 3. Layout (mobile first)

- **Base (≥ 0):** uma coluna ocupando 100% da largura, `max-width: 30rem`, padding de `--content-padding` (16px). Conteúdo na ordem natural de leitura, alinhado à esquerda; só estatísticas, estados vazios e o perfil são centralizados.
- **≥ 48rem:** a coluna continua com 30rem e vira um "aparelho" centralizado, com borda e sombra, sobre o fundo pontilhado. Não existe layout de desktop em várias colunas nesta versão.
- **Alvos de toque:** mínimo de 44px (`--touch-target`). O botão de novo registro tem 56px.
- **Área segura:** o rodapé soma `env(safe-area-inset-bottom)` ao padding.
- **Duas famílias de layout:**
  - `AppLayout`: telas principais, **com** rodapé (início, grupo, perfil, conquistas, configurações).
  - `FocusLayout`: telas de tarefa, **sem** rodapé (login, cadastro, formulários, detalhe do registro).
- **Rodapé:** conquistas (★), novo registro (+, escuro e maior) e configurações (⚙). Dentro de um grupo, o `+` já leva o grupo na URL (`/registros/novo?grupo=ID`).

---

## 4. Componentes reutilizáveis (`src/components/common`)

Importe sempre do barrel (`../../../components/common`).

| Componente | Para que serve | Props principais |
|---|---|---|
| `Button`, `ButtonLink` | Ação (botão) ou navegação (link) com a mesma aparência | `variant`: `primary` (tinta) · `secondary` (branco, padrão) · `ghost`; `fullWidth`, `icon` |
| `IconButton`, `IconLink` | Botão circular só com ícone | `label` (obrigatório, vira `aria-label`), `icon`, `variant`: `light` · `dark`, `size`: `md` · `lg`. `IconLink` marca a rota ativa com `aria-current="page"` e fica "pressionado" |
| `Card` | Bloco com borda e sombra | `tone`: `surface` · `white` · `dotted` · `dark`; `as`; `padded` |
| `Tag` | Rótulo curto | `tone`: `neutral` · `green` · `coral` |
| `Avatar` | Foto de pessoa ou iniciais | `name`, `src`, `size`: `sm` · `md` · `lg` · `xl` |
| `ProgressBar` | Progresso em blocos tracejados | `value`, `max`, `label` |
| `SegmentedControl` | Alternar entre duas ou mais visões | `options`, `value`, `onChange`, `label` |
| `ScreenHeader` | Título da tela + voltar | `title`, `subtitle`, `backTo`, `trailing` |
| `SectionTitle` | Título de seção dentro da tela | `id`, `action` |
| `StatCard` | Número com legenda | `value`, `label` |
| `PhotoFrame` | Moldura de foto com dither | `src`, `alt`, `ratio`, `children` (sobreposição) |
| `PixelSprite` | Pixel art em CSS puro | `rows`, `pixel`, `label` |
| `BottomNav` | Rodapé de navegação | — |
| `StateMessage` | Carregando, vazio e erro | `kind`, `title`, `action` |

### Formulários (`components/common/form`)

| Componente | Quando usar |
|---|---|
| `TextField`, `TextArea`, `SelectField` | Texto, número, data, senha, escolha em lista. Todos aceitam `label`, `hint`, `error`, `optional` |
| `PhotoField` | Foto com pré-visualização e validação de 10 MB antes do envio |
| `ChoiceGroup` | Escolha única apresentada como cartões (ex.: modo de pontuação) |
| `ChipGroup` | Escolha múltipla (ex.: hobbies permitidos, quem fez junto) |
| `FormField` | Base para criar um controle novo com rótulo, dica e erro |

Regras dos campos: rótulo sempre visível (nunca só placeholder); dica abaixo do campo; erro abaixo, com ícone e `role="alert"`, dizendo **o que fazer** ("Informe a duração em minutos, de 1 a 1440"); campos opcionais levam "(opcional)" no rótulo.

---

## 5. Módulos e telas

Cada módulo em `src/modules/<nome>` tem `components/`, `pages/` e um `index.ts` que expõe só o que outros módulos podem usar. Um módulo importa de outro **apenas** pelo `index.ts`.

| Módulo | Páginas | Componentes próprios |
|---|---|---|
| `auth` | `LoginPage`, `RegisterPage` | `AuthHeader`, `LoginForm`, `RegisterForm` |
| `home` | `HomePage` | `HomeHeader` |
| `grupos` | `GroupPage`, `CreateGroupPage`, `JoinGroupPage` | `GroupCard`, `GroupList`, `MemberStack`, `GroupInfo`, `RankingList`, `GroupForm` |
| `registros` | `RecordPage`, `NewRecordPage` | `RecordCard`, `RecordDetail`, `RecordActions`, `RecordForm` |
| `perfil` | `ProfilePage`, `EditProfilePage`, `SettingsPage` | `ProfileHeader`, `StatsRow`, `HobbyTags`, `PastGroupsList`, `ProfileForm`, `ScreenTimeSettings`, `AccountActions` |
| `gamificacao` | `BadgesPage` | `PointsCard`, `BadgeGrid`, `BadgeTile`, `WeeklyChallengeCard`, `data/sprites.ts` |

| Rota | Tela | Layout | Conteúdo |
|---|---|---|---|
| `/` | Home | App | Saudação e acesso ao perfil · grupos do usuário · criar/entrar · desafio da semana |
| `/grupos/:groupId` | Grupo | App | Regras do grupo em tags · convite · abas Feed e Ranking |
| `/registros/:recordId` | Registro | Focus | Foto, hobby, duração, descrição, autores, data, curtir e compartilhar |
| `/registros/novo` | Novo registro | Focus | Formulário (seção 7) |
| `/perfil` | Perfil | App | Dados, registros/horas/badges, hobbies, grupos anteriores |
| `/perfil/editar` | Editar perfil | Focus | Nome, sobrenome, foto |
| `/conquistas` | Conquistas | App | Pontos, desafios concluídos, grade de 12 badges com detalhe |
| `/configuracoes` | Configurações | App | Meta e registro de tempo de tela · sair · excluir conta |
| `/grupos/novo` | Criar grupo | Focus | Formulário (seção 7) |
| `/grupos/entrar` | Entrar com código | Focus | Código do convite |
| `/login`, `/cadastro` | Autenticação | Focus | E-mail, senha (e nome, sobrenome no cadastro) |

### Comportamentos de tela que vêm das regras de negócio

- **Home:** o desafio da semana mostra o prazo ("até domingo") **só** para desafio aleatório; desafio do grupo não tem pressão de tempo. Quando o sistema oferece dois desafios, o card vira a escolha entre os dois.
- **Grupo:** tags mostram modo de pontuação, limite diário e prazo. O botão de convite some quando o grupo encerra. O feed é finito e termina com "Você viu tudo por enquanto."
- **Ranking:** os três primeiros ganham marcador escuro (pódio). A linha do próprio usuário é destacada com a tag "Você". Pontuação é sempre por grupo.
- **Novo registro:** os hobbies seguem a regra do grupo (lista vazia = catálogo todo com "Outro"; um hobby = já vem escolhido). Os textos de ajuda mudam com o `modoPontuacao` e com o `limiteRegistrosPorDia` do grupo.
- **Conquistas:** tocar numa badge abre o detalhe com a descrição e a data; badges bloqueadas dizem "Ainda não conquistada", sem urgência.
- **Configurações:** a meta de tempo de tela é opcional. Sem meta, nada é acompanhado e a conquista "Concentrado" nem é avaliada.

---

## 6. Hobbies e cores de tag

`utils/hobbyTone.ts` define a cor da tag de cada hobby: Leitura e Cozinhar em verde, Arte em coral, Atividade física e Outro em branco. Hobby fora do mapa fica branco. Para um hobby novo no catálogo, basta incluí-lo no mapa.

---

## 7. Formulários e inputs (origem no modelo de dados)

| Tela | Campo | Origem / regra | Componente |
|---|---|---|---|
| Cadastro | Nome, sobrenome | `usuario.nome`, `usuario.sobrenome`, obrigatórios | `TextField` |
| Cadastro, Login | E-mail | `usuario.email`, único | `TextField type="email"` |
| Cadastro, Login | Senha | vira `hashSenha` no servidor; cadastro exige 8+ caracteres (valor provisório) | `TextField type="password"` |
| Editar perfil | Foto de perfil | `usuario.fotoDePerfil`, opcional | `PhotoField` |
| Criar grupo | Nome | `grupo.nome`, obrigatório | `TextField` |
| Criar grupo | Descrição | RF3 (ver seção 12) | `TextArea`, opcional |
| Criar grupo | Foto | `grupo.foto`, opcional | `PhotoField` |
| Criar grupo | Hobbies permitidos | `hobbiesPermitidos`; vazio = livre com "Outro"; um = pré-selecionado | `ChipGroup` |
| Criar grupo | Como os pontos são contados | `modoPontuacao`: `registro` ou `tempo` | `ChoiceGroup` |
| Criar grupo | Limite de registros que pontuam | `limiteRegistrosPorDia`, 1 a 5, opcional | `SelectField` |
| Criar grupo | Data final | `endsAt`, opcional (sem data = grupo contínuo) | `TextField type="date"` |
| Entrar em grupo | Código do convite | RF4 | `TextField` |
| Novo registro | Grupo | `registro.groupId` | `SelectField` |
| Novo registro | Hobby | `registro.hobbyId`, validado contra o grupo | `SelectField` |
| Novo registro | Dia da atividade | `registro.data`, não pode ser futuro | `TextField type="date"` |
| Novo registro | Duração em minutos | `registro.duracaoMinutos`, 1 a 1440 | `TextField type="number"` |
| Novo registro | Foto | `registro.foto`, **obrigatória**, até 10 MB | `PhotoField` |
| Novo registro | Descrição | `registro.descricao`, opcional | `TextArea` |
| Novo registro | Fez junto com alguém? | `registro.userIds` (além do autor); sem confirmação dos marcados | `ChipGroup` |
| Configurações | Meta diária de tempo de tela | `objetivoUsuario.valorMinutos` (`tempo_tela_maximo`), opcional | `TextField type="number"` |
| Configurações | Tempo de tela de hoje | `registroTempoTela.minutos`, informado pelo usuário | `TextField type="number"` |

---

## 8. Estados e texto

- **Carregando:** `StateMessage kind="loading"`. Sem spinner animado nesta versão.
- **Vazio:** convida a agir com um botão ("Registrar atividade", "Criar grupo").
- **Erro:** diz o que aconteceu e o que fazer; não pede desculpas e não é vago.
- **Tom:** frase normal, verbos simples, voz ativa. O botão diz o que acontece ("Salvar registro", "Criar grupo", "Entrar no grupo"), e a ação mantém o mesmo nome no fluxo inteiro.
- **Erro de login** é sempre genérico ("E-mail ou senha incorretos"), sem indicar qual dos dois falhou.

---

## 9. Acessibilidade

- Foco sempre visível (`:focus-visible`, contorno de 2px com recuo de 3px).
- Link "Pular para o conteúdo" em todos os layouts.
- Botões só com ícone têm `aria-label`; sprites decorativos têm `aria-hidden`.
- `SegmentedControl` usa `aria-pressed`; a grade de badges também; barras de progresso usam `role="progressbar"`.
- Erros usam `role="alert"`; confirmações usam `role="status"`.
- Opções marcadas (radio, chip) mostram um ✓ além da inversão de cor, para não depender só de cor.
- `prefers-reduced-motion` desliga transições.
- Texto base de 16px; alvos de toque de 44px.

---

## 10. Atenção do usuário (sem dark patterns)

Checklist para qualquer tela nova:

- [ ] Nenhum contador de "sequência em risco", "você vai perder" ou semelhante.
- [ ] Nenhum aviso de culpa quando um desafio expira, quando um dia fica fora da meta ou quando o usuário não registra.
- [ ] Nenhuma notificação de reengajamento sem consentimento explícito (e notificações ainda não estão definidas no produto).
- [ ] Listas finitas, com sinal claro de fim; nada de rolagem infinita.
- [ ] Contagens de pessoas e pontos só onde ajudam a decisão (ranking, perfil), nunca como isca.
- [ ] Ações destrutivas pedem confirmação em linguagem neutra.
- [ ] Opcional é opcional: meta de tempo de tela, descrição, foto de grupo.
- [ ] O app assume boa-fé: nenhuma tela fiscaliza ou sinaliza o conteúdo dos registros.

---

## 11. Estrutura de pastas

```
apps/web/src/
├── styles/            tokens.css · global.css
├── components/common/ reutilizáveis (+ form/)
├── layouts/           AppLayout · FocusLayout
├── modules/           auth · home · grupos · registros · perfil · gamificacao
│   └── <módulo>/      components/ · pages/ · index.ts   (gamificacao também tem data/)
├── hooks/             dados por domínio (hoje devolvem mocks)
├── mocks/             dados de exemplo
├── types/             tipos de apresentação
├── utils/             format · cx · hobbyTone
├── routes/router.tsx
├── App.tsx
└── main.tsx
```

**Diferença em relação a `ARQUITETURA.md`:** o documento descreve `components/` e `pages/` no topo de `apps/web/src`. Esta entrega agrupa componentes e páginas **por módulo**, mantendo no topo só o que é compartilhado (`components/common`, `layouts`, `hooks`, `utils`). `services/` e `http.ts` continuam como estão no documento. Se a equipe adotar esta organização, vale atualizar a seção 4 de `ARQUITETURA.md`.

Regras mantidas da arquitetura: componente não chama a API; página compõe e decide os estados; dados passam por hooks; estilo vem dos tokens; mobile first.

---

## 12. Como ligar à API e pendências

### Ligação

1. Em `src/hooks/*`, trocar o corpo de cada hook por `useQuery`/`useMutation` do TanStack Query sobre os `services/`. O formato `{ data, isLoading, error }` já é o mesmo, então as páginas não mudam.
2. Substituir `types/domain.ts` pelos tipos inferidos dos schemas Zod de `packages/shared`.
3. Nos formulários (`LoginForm`, `RegisterForm`, `GroupForm`, `RecordForm`, `ProfileForm`), trocar as validações locais pelos schemas de `shared` (regra 1 de `ARQUITETURA.md`). Os pontos estão marcados com `TODO`.
4. Os `handleSubmit` das páginas têm `TODO` com o service que deve ser chamado.
5. Proteger as rotas autenticadas no `router.tsx`.

### Divergências entre o design e os documentos

| Item | Situação | Sugestão |
|---|---|---|
| Descrição do grupo | RF3 pede nome e descrição; `grupo` em `MODELO_DE_DADOS.md` não tem o campo | Adicionar `descricao` ao modelo ou tirar o campo do formulário |
| Código de convite | RF4/RF12 pedem convite por código; não há campo no modelo | Definir onde o código fica (campo em `grupo` ou tabela própria) |
| Curtir | Está no mockup; não há tabela de reações | Criar a tabela ou retirar o botão |
| Sino de notificações | Está no mockup; notificações não foram definidas | Ficou de fora; `HomeHeader` é o lugar para incluí-lo depois |
| Pontos no card de conquistas | O mockup mostra um total; as regras dizem que pontuação é sempre por grupo | O card rotula como "pontos somados de todos os seus grupos", só como resumo pessoal |
| Progresso do desafio | A barra do mockup precisa de um valor derivado de `logAtividades` | Expor o progresso no endpoint do desafio da semana |
| Desafios do grupo | A criação de grupo pode ter desafios próprios; o formulário ainda não tem essa etapa | Incluir quando o formato do cadastro de desafios for definido |
| Editar e excluir registro | A API prevê `PATCH` e `DELETE` pelo autor; não há tela | Adicionar ações no `RecordDetail` para o autor |
| Escolha do desafio | O card tem o estado "escolher entre dois"; falta o endpoint | `onChoose` já está previsto na `HomePage` |

### Dependências

```bash
pnpm --filter web add react-router-dom lucide-react
```

(`lucide-react` fornece os ícones; as fontes vêm do Google Fonts via `global.css`. Para funcionar offline, trocar por `@fontsource/archivo-black` e `@fontsource/karla`.)

---

## 13. Como estender

- **Nova conquista:** adicionar o sprite em `SPRITES`, mapear o nome em `BADGE_SPRITE_BY_NAME` e criar a conquista no backend. Sem sprite, ela usa o brilho.
- **Novo componente comum:** arquivo `.tsx` + `.module.css` em `components/common`, exportado no `index.ts`, usando só tokens.
- **Novo módulo:** pasta com `components/`, `pages/` e `index.ts`; rota registrada em `routes/router.tsx` no layout adequado.
- **Nova cor ou raio:** só entra se resolver um problema que as cinco famílias e os três raios não resolvem. Comece por `tokens.css` e atualize este documento.
