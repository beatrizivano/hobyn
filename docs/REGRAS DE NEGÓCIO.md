# Regras de Negócio e Gamificação

## 1. Cadastro, login e grupos

- **Cadastro (RF1):** email único, dados obrigatórios validados antes de
  concluir o cadastro; dados inválidos ou ausentes impedem a criação da
  conta e geram mensagem de erro.
- **Login (RF2):** credenciais inválidas impedem o acesso e retornam
  mensagem de erro genérica, sem indicar se o email ou a senha está
  incorreta.
- **Criação de grupo (RF3):** exige, no mínimo, nome e descrição. Na criação,
  o admin decide, de forma independente:
  1. **Hobbies:** restringir a uma lista (`hobbiesPermitidos`) ou permitir
     qualquer hobby do catálogo (ver seção 3).
  2. **Duração:** grupo contínuo (sem `endsAt`) ou com prazo final definido.
  3. **Desafios do grupo:** cadastrar desafios próprios ou depender apenas
     dos desafios aleatórios do sistema.
  4. **Modo de pontuação:** por registro ou por tempo (ver seção 4).
  5. **Limite diário de registros:** opcional, de 1 a 5 por usuário por dia.
- **Entrada em grupo (RF4/RF12):** por convite direto a um usuário ou por
  código de acesso compartilhável. Código inválido ou expirado impede a
  entrada e informa o motivo.
- **Papel de administrador:** todo grupo tem exatamente um admin ativo,
  representado por `usuarioGrupo.papel = admin`. Pode convidar membros,
  definir hobbies permitidos, configurar desafios e alterar regras/prazo
  (RF13). Transferência de administração é sempre uma ação explícita.

## 2. Hobbies

- O catálogo de hobbies é fechado e mantido de forma centralizada — usuários
  não podem sugerir novos hobbies.
- Existe um hobby fixo chamado **"Outro"**, sempre disponível quando o grupo
  não define hobbies específicos (`hobbiesPermitidos` vazio), além de todo o
  catálogo já estar liberado nesse caso.
- Se o grupo define exatamente **um** hobby permitido, ele vem
  pré-selecionado por padrão na tela de novo registro (ex.: grupo criado
  especificamente para artesanato).
- Se o grupo restringe a duas ou mais opções, o usuário escolhe entre elas
  normalmente, e "Outro" não é oferecido.

## 3. Registro de atividades

- **Registro (RF10):** exige hobby, data da atividade, duração e **foto
  obrigatória**. Hobby deve pertencer ao conjunto permitido do grupo, quando
  houver restrição.
- **Registro cooperativo:** quando mais de um usuário é listado no mesmo
  registro, todos recebem pontuação automaticamente, com o bônus de
  cooperação — **sem necessidade de confirmação** dos demais envolvidos. O
  autor do registro é responsável pela veracidade da informação.
- **Limite diário de registros:** se o grupo define
  `limiteRegistrosPorDia` (1 a 5), registros além desse número no mesmo dia,
  do mesmo usuário, naquele grupo, continuam sendo salvos no histórico, mas
  não geram pontuação — evita que o valor do ranking seja distorcido por
  volume artificial de postagens.
- **Histórico (RF11):** qualquer membro do grupo pode visualizar os
  registros do grupo (feed), com hobby, data, duração, descrição, autor(es)
  e foto.
- **Limite de mídia (RNF8):** fotos até 10 MB; vídeos até 50 MB por arquivo.
  Upload acima do limite é rejeitado antes de salvar, com aviso claro.

## 4. Pontuação

- A pontuação nunca é global: é sempre relativa a um usuário dentro de um
  grupo específico, calculada a partir da soma de `logAtividades` daquele
  par usuário/grupo (ver `ranking`, no documento de modelo de dados).
- **Modo de pontuação por grupo:** definido na criação do grupo
  (`grupo.modoPontuacao`), pode ser:
  - **Por registro:** cada registro pontua um valor fixo, independente da
    duração da atividade.
  - **Por tempo:** a pontuação escala com a duração registrada (ex.: X
    pontos a cada 30 minutos), incentivando sessões mais longas de hobby.
- Cada ação pontuável tem sua(s) variante(s) cadastrada(s) em `pontuacao`
  (fixo e/ou por tempo). O sistema sempre consulta a variante compatível com
  o modo configurado no grupo daquele registro.
- **Bônus de cooperação:** aplicado como multiplicador sobre o valor-base já
  calculado (fixo ou por tempo), igual para os dois modos.
- **Fluxo de concessão de pontos:**
  1. Um evento pontuável ocorre (registro criado, desafio concluído,
     respeitando o limite diário do grupo).
  2. O sistema consulta `pontuacao` para a ação e o modo do grupo.
  3. Cria-se uma entrada em `logAtividades` para cada usuário beneficiado,
     com o valor já calculado (`pontosGanhos`).
  4. A view de `ranking` do grupo passa a refletir o novo total na próxima
     consulta — não há necessidade de recalcular e persistir nada
     manualmente.

## 5. Elementos de gamificação (taxonomia de Toda et al., 2019)

Elementos organizados segundo a taxonomia proposta em Toda, A. et al., "A
taxonomy of game elements for gamification in educational contexts:
proposal and evaluation" (2019), https://doi.org/10.1186/s40561-019-0106-1 —
citação sujeita a verificação, já que não tenho acesso a busca para
confirmá-la.

### Performance
| Elemento | Instância no app | Regra |
|---|---|---|
| Reconhecimento | Badge de conquista | Concedido via `criterioConquista`, independente de grupo (seção 6). |
| Ponto | Pontuação acumulada por grupo | Ver seção 4. |
| Stats | Tela de estatísticas do perfil | Total de registros, conquistas obtidas, desafios concluídos e colocação em grupos passados. Calculada a partir de `logAtividades`. |

### Ecológico
| Elemento | Instância no app | Regra |
|---|---|---|
| Escolha imposta | Desafio semanal aleatório | O sistema oferece duas opções; o usuário escolhe uma para valer na semana. |
| Pressão de tempo | Prazo do desafio aleatório | Deve ser concluído até a virada da semana (segunda-feira 00h, fuso do servidor); sem conclusão, expira sem pontuar. |

### Pessoal
| Elemento | Instância no app | Regra |
|---|---|---|
| Objetivo | Meta pessoal do usuário | Livre, sem prazo rígido, sem impacto direto no ranking — autoacompanhamento. |
| Desafio | Desafios definidos pelo grupo | Disponíveis durante a semana em que estão em cartaz, sem pressão de tempo adicional dentro dela. |

### Social
| Elemento | Instância no app | Regra |
|---|---|---|
| Competição | Natureza geral do app | Ranking por grupo, ordenado por pontuação, sempre atualizado (view). |
| Cooperação | Registro cooperativo | Bônus de pontos sobre o valor-base, creditado a todos os envolvidos sem necessidade de confirmação mútua. |
| Reputação | Pódio do grupo | Destaque para as 3 primeiras colocações da view de ranking. |

## 6. Ciclo de desafios

- **Origem dupla:** desafio **do grupo** (cadastrado pelo admin, sem prazo
  semanal) ou **aleatório** (gerado pelo sistema, escolha imposta entre duas
  opções, com prazo).
- **Corte semanal:** toda segunda-feira às 00h, no fuso horário do servidor.
- **Proposta semanal:**
  - Grupo sem desafios próprios → todo desafio semanal é aleatório.
  - Grupo com desafios próprios → intercala uma semana de desafio do grupo,
    uma semana de desafio aleatório, e assim por diante.
- **Conclusão:** gera uma linha em `desafioConclusao` e uma entrada em
  `logAtividades` (ação `desafio_concluido`), contando para as estatísticas
  do perfil.

## 7. Conquistas

### Por que não pode ser "só uma view"

O `ranking` (seção 4 / documento de modelo de dados) funciona bem como view
porque é **sempre recalculado, nunca precisa "lembrar" nada** — não há
problema em recalcular a pontuação do zero a cada consulta.

Conquistas são diferentes: **desbloquear uma é um evento que acontece uma
única vez** e precisa ficar registrado (`usuarioConquista`), mesmo que a
condição que a originou deixe de ser verdadeira depois (ex.: uma streak que
é quebrada não deve fazer a conquista já concedida desaparecer). Uma view
pura não tem como "lembrar" que algo já foi concedido — ela só sabe
responder "a condição é verdadeira agora?", não "essa condição já foi
verdadeira alguma vez e precisa ser marcada como conquistada?".

### Três famílias de checagem

**1. Reativa a ações de hobby/grupo/desafio** — a maioria das conquistas.
Uma função genérica `checaConquista(evento, params)` roda de forma
assíncrona logo depois do evento `registro`, `desafio` ou `grupo_criado`:

1. O evento acontece.
2. O sistema busca em `criterioConquista` os critérios cujo `tipo` é
   compatível com aquele evento, e que o usuário **ainda não tem** em
   `usuarioConquista`.
3. Para cada candidato, chama a função avaliadora do `tipo` correspondente —
   reaproveitada por todas as conquistas daquele tipo — e compara o valor
   atual com `criterio.valor` (e `hobbyId`, quando aplicável).
4. Se o valor atual atinge ou ultrapassa o critério, cria-se a linha em
   `usuarioConquista`, uma única vez, de forma idempotente.

**2. Reativa ao registro pessoal de tempo de tela.** Mesma lógica da família
1, mas disparada por um evento diferente — `tempo_tela_registrado`, quando o
usuário informa manualmente quanto tempo de tela teve em um dia — e só roda
se o usuário tiver uma meta definida (`objetivoUsuario`). Ver detalhe da
conquista "Concentrado" abaixo.

**3. Encerramento de um grupo com prazo definido.** A conquista de pódio não
precisa de nenhuma checagem contínua — ela só existe no momento em que um
grupo com `endsAt` se encerra. Basta um único evento `grupo_encerrado`,
disparado quando `now >= grupo.endsAt` pela primeira vez. Como não há
necessidade de observar nada ao longo do tempo (diferente de uma streak),
esse evento pode inclusive ser avaliado de forma preguiçosa (lazy): na
primeira vez que alguém acessa aquele grupo depois do prazo vencido, o
sistema verifica `grupo.fechamentoProcessadoEm`; se ainda estiver nulo,
calcula a colocação final de cada membro (via view de `ranking`) e concede
"Pódio" a quem terminou entre os 3 primeiros, depois marca
`fechamentoProcessadoEm` para nunca reprocessar. Não é necessário nenhum job
rodando em segundo plano para esse caso — só uma checagem no momento certo
de acesso, ou, alternativamente, um job leve e esporádico (não semanal, só
o suficiente para não depender de alguém abrir o grupo) que varre grupos
com `endsAt` vencido e `fechamentoProcessadoEm` nulo.

### Tipos de critério

| Tipo | Família | O que mede | Exemplo de cálculo |
|---|---|---|---|
| `contagem_registros` | 1 (`registro`) | Quantidade de registros do usuário, opcionalmente filtrando por `hobbyId` | Contar linhas de `registro` onde o usuário está em `userIds` (e `hobbyId` bate, se definido) |
| `contagem_tempo` | 1 (`registro`) | Soma de minutos registrados, opcionalmente filtrando por `hobbyId` | Somar `duracaoMinutos` dos registros do usuário (e `hobbyId`, se definido) |
| `contagem_hobbies_distintos` | 1 (`registro`) | Quantidade de hobbies diferentes já registrados pelo usuário | Contar `hobbyId` distintos entre os registros do usuário |
| `contagem_cooperativos` | 1 (`registro`) | Quantidade de registros cooperativos dos quais o usuário participou | Contar registros onde `userIds.length > 1` e o usuário está incluído |
| `streak_dias` | 1 (`registro`) | Maior sequência de dias consecutivos com ao menos um registro, contagem unitária (um registro no dia já conta, independente de duração ou do `modoPontuacao` do grupo) | Ver `streakUsuario` no documento de modelo de dados |
| `contagem_grupos` | 1 (`registro`) | Número de grupos distintos em que o usuário participou de fato | Contar `groupId` distintos com ao menos uma entrada em `logAtividades` — ser apenas membro sem nunca ter registrado nada não conta |
| `contagem_grupos_criados` | 1 (`grupo_criado`) | Número de grupos criados pelo usuário | Contar `grupo.criadoPor = userId` |
| `contagem_desafios` | 1 (`desafio`) | Quantidade de desafios concluídos pelo usuário | Contar linhas em `desafioConclusao` do usuário |
| `posicao_grupo` | 1 (`registro` e `desafio`, pois ambos podem mudar a colocação) | Se o usuário já alcançou uma posição-alvo em algum grupo, a qualquer momento | Consultar a view de `ranking` logo após o evento; `criterio.valor` é a posição-alvo (ex.: `1` para primeiro lugar) |
| `tempo_tela_streak` | 2 (`tempo_tela_registrado`) | Dias consecutivos em que o tempo de tela relatado ficou dentro da meta pessoal | Ver detalhe da conquista "Concentrado" abaixo |
| `podio_encerramento_grupo` | 3 (`grupo_encerrado`) | Se o usuário terminou entre os 3 primeiros quando um grupo de duração finita se encerrou | Colocação final na view de `ranking` do grupo, no momento do encerramento; `criterio.valor` é a posição máxima aceitável (ex.: `3`) |

### As 12 conquistas propostas

| Conquista | Tipo | Critério |
|---|---|---|
| Líder | `contagem_grupos_criados` | 1 grupo criado |
| Focado | `streak_dias` | 7 dias consecutivos com ao menos um registro |
| Muito Focado | `streak_dias` | 30 dias consecutivos com ao menos um registro |
| De Tudo um Pouco | `contagem_hobbies_distintos` | 10 hobbies diferentes registrados |
| Chef | `contagem_registros` | 50 registros do hobby "Cozinhar" |
| Atleta | `contagem_registros` | 50 registros do hobby "Atividade Física" |
| Leitor | `contagem_registros` | 50 registros do hobby "Leitura" |
| Artista | `contagem_registros` | 50 registros do hobby "Arte" |
| Amigo | `contagem_cooperativos` | 5 registros cooperativos |
| N.1 | `posicao_grupo` | 1º lugar em algum grupo |
| Pódio | `podio_encerramento_grupo` | entre os 3 primeiros no encerramento de um grupo com prazo definido |
| Concentrado | `tempo_tela_streak` | 7 dias consecutivos dentro da meta pessoal de tempo de tela |

### Detalhe: "Pódio"

Aplica-se **somente a grupos com `endsAt` definido** — grupos contínuos
nunca geram essa conquista, já que não têm um momento de encerramento. A
checagem acontece uma única vez, no fechamento do grupo (ver família 3
acima), olhando só para a colocação final, sem exigir nenhum tipo de
consistência ao longo do tempo de vida do grupo.

### Detalhe: "Concentrado"

Diferente da ideia original de comparar períodos, esta conquista depende de
duas coisas que o próprio usuário define e informa, sem relação com nenhum
grupo:

- **Meta pessoal** (`objetivoUsuario`, `tipo = tempo_tela_maximo`): o
  usuário decide, se quiser, um limite diário de tempo de tela.
- **Registro diário** (`registroTempoTela`): o usuário pode informar
  manualmente quanto tempo de tela teve em um dia específico — o app não
  mede isso automaticamente.

A checagem, disparada quando o usuário salva um `registroTempoTela`:

1. **Se o usuário não tem `objetivoUsuario` de tempo de tela definido, a
   checagem nem roda** — a conquista simplesmente não existe para esse
   usuário até que ele defina uma meta.
2. Se tem meta, verifica se o `registroTempoTela` do dia está dentro do
   limite (`minutos <= objetivoUsuario.valorMinutos`).
3. Verifica se isso se repete pelos 7 dias mais recentes (o dia atual e os 6
   anteriores), todos com `registroTempoTela` salvo e dentro da meta.
4. Se as 7 verificações batem, concede "Concentrado".

Por ser inteiramente opt-in (exige que o usuário defina uma meta e registre
manualmente todos os dias), essa conquista naturalmente não pressiona quem
não tem interesse em acompanhar o próprio tempo de tela — ninguém é
notificado ou cobrado por não ter uma meta definida.

### Compatibilidade com "evitar dark patterns" (seção 9)

A conquista de streak celebra consistência, mas **não deve virar um
lembrete de pressão**: a interface pode mostrar "você conquistou 7 dias
seguidos!" quando acontece, mas não deve exibir um contador ao vivo do tipo
"sua sequência está em risco, poste hoje para não perder" — isso
reintroduziria o mesmo tipo de gatilho de ansiedade que o projeto quer
evitar em outras partes do app (seção 9). O mesmo vale para "Concentrado":
o app não deve notificar o usuário lembrando de registrar o tempo de tela,
nem exibir mensagens de cobrança quando um dia fica fora da meta —
`streakUsuario` e o acompanhamento de tempo de tela são métricas internas,
não elementos de urgência na interface.

## 8. Encerramento e saída de grupos

- Ao atingir `endsAt`, o grupo vira somente leitura: nenhum novo registro,
  desafio ou membro é aceito; histórico e ranking final continuam visíveis.
- A saída de um usuário marca `usuarioGrupo.saiuEm`, sem apagar dados —
  ele some do ranking "ao vivo" exibido aos membros atuais, mas seu
  histórico permanece íntegro para as próprias estatísticas.

## 9. Atenção do usuário e ausência de dark patterns

Regras transversais a toda a gamificação, alinhadas ao objetivo do projeto
de incentivar o afastamento da tela:

- Nenhuma "sequência" (streak) que penalize visualmente o usuário por não
  postar em determinado dia.
- Desafios expirados são informados de forma neutra, sem linguagem de culpa.
- Feed de grupo é finito por período, sem scroll infinito.
- O limite diário de registros (seção 3) também cumpre um papel de
  moderação: evita que o app vire um incentivo a postar excessivamente só
  para pontuar, o que iria contra o próprio objetivo do produto.
