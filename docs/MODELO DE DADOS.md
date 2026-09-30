# Modelo de Dados — Comportamento das Tabelas

Este documento descreve o comportamento esperado de cada tabela do sistema. As
regras de negócio que atravessam mais de uma tabela (pontuação, ranking,
desafios, conquistas) estão detalhadas em
`02-regras-de-negocio-e-gamificacao.md`.

---

## `usuario`

| Campo | Tipo | Observação |
|---|---|---|
| id | PK | |
| nome | string | obrigatório |
| sobrenome | string | obrigatório |
| email | string | obrigatório, único |
| hashSenha | string | nunca armazenar senha em texto puro |
| createdAt / updatedAt | datetime | auditoria padrão |
| deletedAt | datetime? | soft delete — ver seção "Exclusão" |
| fotoDePerfil | string? | opcional; sem valor, a interface exibe um avatar padrão (iniciais) |
| conquistas | via `usuarioConquista` | ver seção de conquistas |

**Comportamentos**
- `email` é o identificador único de login (RF1).
- `conquistas` é independente de grupo e não é apagada quando o usuário sai
  de um grupo.
- **Exclusão:** usa soft delete (`deletedAt`). Um usuário "excluído" não
  aparece mais em buscas, convites ou listagens ativas, mas seus `registro`,
  `logAtividades` e participações históricas em grupos permanecem intactos,
  preservando o histórico dos grupos dos quais participou (RNF5).

---

## `grupo`

| Campo | Tipo | Observação |
|---|---|---|
| id | PK | |
| nome | string | obrigatório |
| hobbiesPermitidos | relação N:N com `hobby` | opcional |
| modoPontuacao | enum: `registro` \| `tempo` | definido na criação, ver seção de pontuação |
| limiteRegistrosPorDia | number? (1 a 5) | opcional, ver seção de registro |
| createdAt / updatedAt | datetime | |
| deletedAt | datetime? | soft delete |
| endsAt | datetime? | opcional — grupo contínuo ou de duração finita |
| foto | string? | opcional |
| desafios | relação N:N com `desafio`? | desafios definidos pelo grupo, opcional |
| criadoPor | FK `usuario` | usuário que criou o grupo — imutável, mesmo que a administração seja transferida depois |
| fechamentoProcessadoEm | datetime? | nulo até o encerramento do grupo ser processado; ver seção 7 das regras de negócio (conquista de pódio) |

O campo `admin` e a lista `usuarios[]` deixam de existir como campos diretos
em `grupo` e passam a ser representados pela tabela de associação abaixo, já
que uma relação N:N com atributos próprios (papel, data de entrada, data de
saída) não é representável como um array simples em um banco relacional.

### `usuarioGrupo` (tabela de associação)

| Campo | Tipo | Observação |
|---|---|---|
| userId | FK `usuario` | |
| groupId | FK `grupo` | |
| papel | enum: `admin` \| `membro` | |
| entrouEm | datetime | |
| saiuEm | datetime? | nulo enquanto o usuário está ativo no grupo |

**Comportamentos**
- `criadoPor` existe separado do `papel = admin` em `usuarioGrupo` porque a
  administração pode ser transferida ao longo do tempo, mas "quem criou o
  grupo" é um fato histórico que não deveria mudar — é o campo usado, por
  exemplo, pela conquista de criar um grupo (ver seção 7 das regras de
  negócio).
- Todo grupo deve ter exatamente um `usuarioGrupo` com `papel = admin` e
  `saiuEm` nulo a qualquer momento em que o grupo tiver membros ativos. A
  transferência de administração é uma operação explícita (mudar o `papel`
  de dois registros na mesma transação), nunca implícita.
- **`hobbiesPermitidos` vazio ou nulo = sem restrição** (ver regras de hobby
  na seção 3 deste documento e nas regras de negócio).
- **`endsAt` nulo = grupo contínuo.** Se definido, ao ser atingido o grupo
  passa a ser somente leitura: nenhum novo registro, desafio ou membro é
  aceito. Esse também é o momento em que a conquista de pódio (seção 7 das
  regras de negócio) é avaliada; `fechamentoProcessadoEm` evita que essa
  avaliação rode mais de uma vez para o mesmo grupo.
- **`desafios` vazio ou nulo = grupo só recebe desafios aleatórios**; se
  houver desafios próprios, o sistema intercala com os aleatórios (ver regras
  de negócio).
- **`modoPontuacao`** define se os registros de hobby daquele grupo pontuam
  por ocorrência (`registro`) ou proporcionalmente à duração (`tempo`) — ver
  seção `pontuacao` abaixo.
- **`limiteRegistrosPorDia`** (opcional, de 1 a 5): número máximo **total**
  de registros pontuáveis que um mesmo usuário pode enviar por dia naquele
  grupo, somando todos os hobbies (não é um limite por hobby). Sem valor
  definido, não há limite. Serve como proteção leve contra uso excessivo do
  app para "farmar" pontos — não como fiscalização do conteúdo postado (ver
  nota de boa-fé na seção de registro).
- **Saída de um membro:** define `saiuEm` no `usuarioGrupo` correspondente,
  em vez de apagar a linha. Isso permite:
  - excluir o usuário do ranking "ao vivo" exibido aos membros atuais;
  - ainda assim manter o histórico de pontuação e colocação daquele usuário
    naquele grupo, usado na tela de estatísticas do perfil.

---

## `hobby`

| Campo | Tipo | Observação |
|---|---|---|
| id | PK | |
| nome | string | obrigatório, único |
| createdAt / updatedAt | datetime | |

**Comportamentos**
- Catálogo global, fechado: hobbies **não podem ser sugeridos por usuários**,
  apenas cadastrados por administração central do produto.
- Existe uma entrada fixa e permanente chamada **"Outro"**, que não pode ser
  removida do catálogo.
- **Regra de disponibilidade em um grupo:**
  - Se `grupo.hobbiesPermitidos` está vazio (grupo sem hobbies específicos),
    todos os hobbies do catálogo ficam disponíveis para registro, **e o
    hobby "Outro" também fica disponível** como opção padrão para o que não
    se encaixa nos demais.
  - Se `grupo.hobbiesPermitidos` tem uma ou mais entradas, apenas essas
    ficam disponíveis — "Outro" não aparece como opção nesse caso.
  - **Se `grupo.hobbiesPermitidos` tem exatamente um hobby** (ex.: um grupo
    criado só para artesanato), esse hobby vem **pré-selecionado por
    padrão** na tela de novo registro, dispensando a etapa de escolha.
- Um hobby não pode ser removido do catálogo se já houver `registro` ou
  `desafio` vinculado a ele — apenas desativado.

---

## `pontuacao`

| Campo | Tipo | Observação |
|---|---|---|
| id | PK | |
| nome | string | nome da ação pontuável (ex.: `registro_hobby`, `desafio_concluido`, `bonus_cooperativo`) |
| modo | enum: `fixo` \| `porTempo` | ver abaixo |
| valor | number | pontos (fixo) ou pontos por unidade de tempo (porTempo) |
| unidadeTempoMinutos | number? | obrigatório apenas quando `modo = porTempo`; fixo em `30` para todas as ações — "`valor` pontos a cada 30 minutos de duração" |

**Comportamentos**
- Tabela de configuração/regra — nunca guarda saldo de usuário.
- Como o modo de pontuação é uma escolha do grupo (`grupo.modoPontuacao`),
  uma mesma ação pode ter **duas variantes** cadastradas em `pontuacao`: uma
  com `modo = fixo` e outra com `modo = porTempo`. Ao pontuar um registro, o
  sistema busca a variante compatível com o `modoPontuacao` do grupo em que
  o registro foi feito.
  - Exemplo: ação `registro_hobby` → variante fixa (`valor: 5`, pontua 5 por
    registro, independente da duração) e variante por tempo (`valor: 2`,
    `unidadeTempoMinutos: 30`, pontua 2 pontos a cada 30 minutos registrados,
    arredondado para baixo).
- O **bônus de cooperação** (ação `bonus_cooperativo`) é aplicado como um
  multiplicador sobre o valor já calculado pela ação `registro_hobby`
  (fixo ou por tempo, conforme o grupo), e não depende do `modoPontuacao` —
  ou seja, existe uma única variante de `bonus_cooperativo`, aplicada por
  cima do cálculo base.
- Toda ação pontuável do sistema deve ter uma linha correspondente aqui;
  nenhuma pontuação deve ser atribuída "no código" sem refletir nesta tabela.

---

## `registro`

| Campo | Tipo | Observação |
|---|---|---|
| id | PK | |
| createdAt / updatedAt | datetime | quando o post foi criado/editado no sistema |
| data | date | quando a atividade de fato ocorreu |
| duracaoMinutos | number | duração da atividade, em minutos |
| foto | string | **obrigatória** |
| userIds | array de `usuario` | um ou mais usuários — registro cooperativo quando > 1 |
| groupId | FK `grupo` | obrigatório |
| hobbyId | FK `hobby` | obrigatório |
| descricao | string | |

**Comportamentos**
- **Foto é obrigatória** em todo registro, sem exceção.
- `data` e `duracaoMinutos` são campos necessários e explícitos: o RF10 exige
  essas informações, e `duracaoMinutos` é indispensável quando
  `grupo.modoPontuacao = tempo`, já que a pontuação depende diretamente dela.
- `hobbyId` deve pertencer a `hobbiesPermitidos` do grupo quando essa lista
  não estiver vazia; caso contrário, qualquer hobby do catálogo (incluindo
  "Outro") é aceito.
- **Registro cooperativo:** quando `userIds` tem mais de um usuário, **não é
  necessária confirmação dos demais envolvidos** — o autor do registro credita
  pontos a todos os usuários listados diretamente, com o bônus de cooperação
  aplicado (ação `bonus_cooperativo`).
- **Limite diário:** se `grupo.limiteRegistrosPorDia` está definido, um novo
  registro do mesmo usuário naquele grupo, além do limite total no mesmo dia
  (somando todos os hobbies, considerando o dia da `data` da atividade),
  ainda pode ser salvo no histórico, mas não gera nova entrada em
  `logAtividades` (não pontua) — a interface deve informar isso claramente
  ao usuário no momento do envio.
- **Boa-fé:** o sistema não valida o conteúdo da foto, da descrição nem o
  hobby "Outro" contra o que de fato foi praticado. O app assume boa-fé do
  usuário e não tem como objetivo fiscalizar ou auditar cada registro —
  inclusive registros com hobby "Outro" não precisam de nenhuma sinalização
  ou revisão especial por parte do admin do grupo.
- A criação de um `registro` válido gera, na mesma transação, uma entrada em
  `logAtividades` para cada usuário em `userIds` (respeitando o limite
  diário acima).

---

## `logAtividades`

| Campo | Tipo | Observação |
|---|---|---|
| userId | FK `usuario` | |
| groupId | FK `grupo` | |
| pontuacaoId | FK `pontuacao` | tipo de ação que gerou o log (renomeado de `atividadeId`) |
| pontosGanhos | number | valor efetivamente creditado no momento do evento |
| registroId | FK `registro`? | preenchido quando a origem foi um registro de hobby |
| desafioId | FK `desafio`? | preenchido quando a origem foi a conclusão de um desafio |
| data | datetime | quando o log foi gerado |

**Comportamentos**
- Tabela de histórico bruto e append-only: nunca é editada ou apagada, mesmo
  que o `registro` ou `desafio` de origem seja removido depois (RNF5).
- `pontosGanhos` guarda o valor **já calculado no momento do evento**,
  independente de mudanças futuras nos valores de `pontuacao` — preserva a
  precisão histórica.
- É a fonte de verdade para:
  - a pontuação e colocação de um usuário em um grupo (ver `ranking`, a
    seguir);
  - o histórico de atividades do usuário (RF11);
  - a tela de estatísticas do perfil.

---

## `ranking` (view calculada, não é uma tabela armazenada)

Em vez de uma tabela própria, `ranking` passa a ser uma **view**, calculada a
partir de `logAtividades` sempre que consultada:

```
pontuacaoDoUsuarioNoGrupo = SOMA(logAtividades.pontosGanhos)
                            ONDE userId = X E groupId = Y

colocacaoNoGrupo = posição de X ao ordenar todos os usuários
                   ativos do grupo Y por pontuacaoDoUsuarioNoGrupo,
                   do maior para o menor
```

**Comportamentos**
- Não existe risco de a pontuação "dessincronizar" da fonte de verdade,
  porque ela é sempre recalculada, nunca escrita diretamente.
- O ranking "ao vivo" de um grupo considera apenas usuários com
  `usuarioGrupo.saiuEm` nulo (membros ativos). As estatísticas de perfil de
  um usuário que já saiu do grupo continuam calculáveis normalmente, porque
  os dados vêm de `logAtividades`, que nunca é apagado.
- Quando `grupo.endsAt` é atingido, nenhum novo `logAtividades` é gerado
  para aquele grupo (o grupo vira somente leitura), então a view
  naturalmente para de mudar — não é necessário nenhum mecanismo adicional
  de "congelamento".
- Caso o volume de dados no futuro torne o recálculo constante custoso, essa
  view pode ser materializada em uma tabela cacheada sem alterar a regra de
  negócio, apenas a implementação.

---

## `desafio`

| Campo | Tipo | Observação |
|---|---|---|
| id | PK | |
| nome | string | |
| descricao | string | |
| tipo | enum: `grupo` \| `aleatorio` | |
| groupId | FK `grupo`? | preenchido apenas quando `tipo = grupo` |
| pontuacaoId | FK `pontuacao` | valor de pontos ao ser concluído |
| expiraEm | datetime? | aplicável apenas a desafios do `tipo = aleatorio` |
| createdAt / updatedAt | datetime | |

### `desafioConclusao` (tabela de associação)

| Campo | Tipo | Observação |
|---|---|---|
| userId | FK `usuario` | |
| desafioId | FK `desafio` | |
| groupId | FK `grupo` | |
| concluidoEm | datetime | |

**Comportamentos**
- **Desafios do grupo** (`tipo = grupo`): cadastrados pelo admin, ficam
  disponíveis durante a semana em que estão "em cartaz" no ciclo do grupo,
  sem `expiraEm` — não há pressão de tempo adicional dentro daquele
  intervalo.
- **Desafios aleatórios** (`tipo = aleatorio`): apresentados em par (escolha
  imposta) e com `expiraEm` até o fim da semana corrente (pressão de tempo).
  Não concluído até lá, expira sem gerar `desafioConclusao` nem pontuação.
- **Corte semanal:** toda virada de semana ocorre **às segundas-feiras, 00h,
  no fuso horário do servidor**. É nesse momento que um novo desafio (do
  grupo ou aleatório, conforme o ciclo de intercalação) é proposto, e
  desafios aleatórios vencidos expiram.
- Ao concluir, cria-se uma linha em `desafioConclusao` e uma entrada
  correspondente em `logAtividades` (via `pontuacaoId`), pontuando no grupo
  em que o desafio estava ativo.

---

## `conquista`

| Campo | Tipo | Observação |
|---|---|---|
| id | PK | |
| nome | string | |
| descricao | string | |

### `criterioConquista`

| Campo | Tipo | Observação |
|---|---|---|
| conquistaId | FK `conquista` | |
| tipo | enum: `contagem_registros` \| `contagem_tempo` \| `contagem_hobbies_distintos` \| `contagem_cooperativos` \| `streak_dias` \| `contagem_grupos` \| `contagem_grupos_criados` \| `contagem_desafios` \| `posicao_grupo` \| `podio_encerramento_grupo` \| `tempo_tela_streak` | ver seção 7 das regras de negócio para o significado de cada tipo e qual família de checagem ele pertence |
| hobbyId | FK `hobby`? | opcional; filtra o critério a um hobby específico (aplicável a `contagem_registros` e `contagem_tempo`) |
| valor | number | quantidade necessária para desbloquear (registros, minutos, dias consecutivos, grupos ou desafios, conforme `tipo`) |

### `usuarioConquista` (tabela de associação)

| Campo | Tipo | Observação |
|---|---|---|
| userId | FK `usuario` | |
| conquistaId | FK `conquista` | |
| conquistadoEm | datetime | |

### `streakUsuario`

| Campo | Tipo | Observação |
|---|---|---|
| userId | PK, FK `usuario` | |
| streakRecorde | number | maior sequência de dias consecutivos com ao menos um registro, já alcançada pelo usuário |
| ultimoDiaComRegistro | date | data do último dia em que o usuário registrou alguma atividade, em qualquer grupo |

### `objetivoUsuario`

| Campo | Tipo | Observação |
|---|---|---|
| id | PK | |
| userId | FK `usuario` | |
| tipo | enum: `tempo_tela_maximo` (extensível para outros objetivos pessoais no futuro) | |
| valorMinutos | number | limite diário de tempo de tela desejado pelo próprio usuário |
| createdAt / updatedAt | datetime | atualizado se o usuário mudar sua meta |

### `registroTempoTela`

| Campo | Tipo | Observação |
|---|---|---|
| id | PK | |
| userId | FK `usuario` | |
| data | date | dia a que o registro se refere |
| minutos | number | tempo de tela relatado pelo próprio usuário naquele dia — informado manualmente, não medido pelo sistema |
| createdAt | datetime | |

Recomenda-se uma restrição de unicidade em `(userId, data)`: um único
registro de tempo de tela por usuário por dia.

**Comportamentos**
- Critérios de conquista são **globais e independentes de grupo**: avaliados
  sobre todo o histórico do usuário, somando todos os grupos em que
  participou ou participa. Ver seção 7 do documento de regras de negócio
  para a definição completa de cada tipo de critério e exemplos de
  conquistas.
- `streakUsuario` conta apenas a **existência** de ao menos um registro de
  hobby naquele dia — é uma contagem unitária, não depende de duração nem do
  `modoPontuacao` do grupo em que o registro foi feito. Um grupo com
  `modoPontuacao = tempo` e outro com `modoPontuacao = registro` contam da
  mesma forma para a streak: basta ter postado algo naquele dia. A sequência
  **atual** é calculada sob demanda (não fica armazenada), olhando para trás
  a partir de `ultimoDiaComRegistro`; o **recorde** é armazenado e
  atualizado apenas quando a sequência atual supera o valor já guardado.
- `objetivoUsuario` e `registroTempoTela` existem só para dar suporte à
  conquista de tempo de tela: o usuário define, se quiser, uma meta diária
  de tempo de tela (`objetivoUsuario`), e pode registrar manualmente quanto
  tempo de tela teve em um dia (`registroTempoTela`). Nenhuma dessas duas
  ações é obrigatória — um usuário que nunca definiu meta simplesmente nunca
  entra na checagem dessa conquista (ver seção 7 das regras de negócio).
- A checagem de conquistas dos tipos ligados a ações do usuário no app
  (contagem, streak, posição no ranking, tempo de tela) ocorre de forma
  assíncrona logo após o evento correspondente. Já a conquista de pódio
  (`podio_encerramento_grupo`) é avaliada uma única vez, no momento em que
  um grupo de duração finita se encerra — não precisa de nenhum job
  periódico rodando continuamente (ver seção 7 das regras de negócio para o
  detalhe completo do fluxo de cada tipo).
- Uma vez criada a linha em `usuarioConquista`, ela é permanente: não é
  removida por saída de grupo, encerramento de grupo, exclusão de registros
  antigos, nem por uma streak ser quebrada depois.
