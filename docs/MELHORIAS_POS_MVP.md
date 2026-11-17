# Melhorias após o MVP

Este documento reúne melhorias funcionais e visuais que podem ser feitas depois
da entrega do MVP. Elas não alteram o critério atual de conclusão. A ordem abaixo
considera primeiro o benefício para quem usa o produto; em benefícios semelhantes,
o menor esforço e as dependências determinam a posição.

> **Concluído em 17/11/2026:** confirmação de senha no cadastro, recuperação,
> alteração autenticada com revogação de sessões e ativação configurável por
> e-mail. A configuração está em
> [Ativação por e-mail e senhas](AUTENTICACAO_EMAIL_E_SENHA.md).

> **Concluído em 17/11/2026:** saída do grupo, remoção exclusiva pelo
> administrador e sucessão automática para o membro ativo mais antigo,
> preservando o histórico de registros.

## Escala

- **Benefício muito alto:** recupera acesso, fecha um fluxo essencial ou muda
  claramente a utilidade cotidiana do produto.
- **Benefício alto:** aumenta retenção, clareza, confiança ou qualidade percebida.
- **Benefício médio:** traz refinamento importante, mas não bloqueia o uso atual.
- **Esforço P/M/G:** pequeno, médio ou grande; inclui API, banco, interface e testes.

## Ranking global

| Rank | Módulo | Melhoria | Benefício | Esforço | Motivo da posição |
| ---: | --- | --- | --- | :---: | --- |
| 1 | Autenticação | Recuperação de senha (“Esqueci minha senha”) | Muito alto | G | Evita perda definitiva de acesso e é esperado em qualquer produto com conta. |
| 2 | Grupos | Sair do grupo, remover membro e transferir administração | Muito alto | G | Fecha o ciclo real de membros e evita grupos presos a um único administrador. |
| 3 | Home | Transformar a home em dashboard útil | Muito alto | M | Dá contexto imediato e reduz passos para registrar, continuar ou acompanhar um hobby. |
| 4 | Gamificação | Conquistas e desafios reais | Muito alto | G | É o principal diferencial do Hobyn além de um diário de atividades. |
| 5 | Perfil | Estatísticas e histórico pessoal | Muito alto | M | Mostra evolução e devolve valor acumulado à pessoa que registra hobbies. |
| 6 | Responsividade | Layout próprio para tablet e desktop | Muito alto | M | Melhora toda a aplicação em telas maiores, hoje limitada a uma coluna mobile centralizada. |
| 7 | Cadastro | Confirmar senha no cadastro | Alto | P | Evita contas criadas com senha digitada incorretamente por um custo muito baixo. |
| 8 | Autenticação | Alterar senha com confirmação da senha atual | Alto | M | Completa a gestão da conta e reduz dependência da recuperação por e-mail. |
| 9 | Registros | Busca e filtros por grupo, hobby, pessoa e período | Alto | M | Torna o histórico útil quando o volume de registros crescer. |
| 10 | Grupos/convites | Convite direto a uma conta e gestão dos convites | Alto | G | Complementa o código compartilhável e oferece mais controle ao administrador. |
| 11 | Identidade visual | Logo, símbolo e wordmark oficiais | Alto | M | Dá reconhecimento ao produto e unifica login, cadastro, home e materiais de apresentação. |
| 12 | Registros/social | Curtidas ou reações simples | Alto | G | Aumenta interação entre membros, mas exige modelo, permissões e prevenção de duplicidade. |
| 13 | Home | Onboarding e estados vazios orientados | Alto | P | Ajuda a primeira utilização sem exigir um tutorial longo. |
| 14 | Estilo | Biblioteca de vetores/ilustrações do Hobyn | Alto | M | Torna telas vazias e momentos-chave mais atraentes sem mudar os fluxos. |
| 15 | Ranking | Evolução de posição, regras de empate e pódio final | Médio/alto | M | Torna a classificação mais compreensível e interessante ao longo do grupo. |
| 16 | Fotos | Recorte, reposicionamento e remoção explícita de foto | Médio/alto | M | Dá controle visual sem alterar o pipeline seguro já implementado. |
| 17 | Autenticação | Limite de tentativas em login e recuperação | Médio/alto | M | Protege contas antes de uma disponibilização pública. |
| 18 | Notificações | Central de eventos com preferências e consentimento | Médio | G | Pode trazer pessoas de volta, mas deve respeitar a política de atenção do produto. |
| 19 | Sessão | Sincronizar login/logout/refresh entre abas | Médio | M | Evita inconsistências para quem usa várias abas simultaneamente. |
| 20 | Acessibilidade | Auditoria completa com teclado e leitor de tela | Médio | M | Reduz barreiras e previne regressões conforme o visual evoluir. |
| 21 | Plataforma | Armazenamento de fotos em serviço externo | Médio | G | Necessário para produção distribuída, mas não melhora a demonstração local. |
| 22 | Plataforma | PWA, cache do shell e instalação | Médio | G | Melhora acesso recorrente, mas depende de estratégia clara para dados offline. |

## Melhorias por módulo

### 1. Autenticação e conta

1. **Esqueci minha senha.** Adicionar o link na tela de login, uma tela para
   solicitar recuperação e outra para definir a nova senha. A API deve responder
   da mesma forma para e-mails existentes ou inexistentes, armazenar somente o
   hash de um token aleatório, impor validade curta e uso único, e revogar as
   sessões após a troca. Em desenvolvimento, o envio pode usar um adaptador local;
   em produção, requer provedor de e-mail e URL pública configurada.
2. **Confirmação de senha no cadastro.** O campo `confirmarSenha` existe somente
   na web e nunca é enviado à API. Deve validar igualdade antes do submit, permitir
   colar a senha e anunciar o erro de forma acessível. Tecnicamente esta melhoria
   pertence ao **cadastro (sign-up)**; no **login (sign-in)** uma segunda senha não
   acrescentaria segurança.
3. **Alterar senha autenticado.** Exigir senha atual, nova senha e confirmação;
   limitar a 72 bytes como no cadastro e permitir revogar as outras sessões.
4. **Proteção contra abuso.** Limitar tentativas por conta e IP nas rotas de login,
   cadastro e recuperação, com resposta previsível e sem bloqueio permanente.
5. **Sessões entre abas e dispositivos.** Usar `BroadcastChannel` para sincronizar
   logout/refresh e, depois, oferecer lista de sessões com opção de encerrá-las.
6. **Verificação de e-mail.** Útil antes de convites diretos, notificações e
   recuperação em produção; não deve bloquear a demonstração local.

### 2. Home e navegação

1. **Reformular a home como dashboard.** A rota `/` já existe, mas pode reunir:
   saudação e perfil, ação primária “Registrar atividade”, grupos recentes,
   posição resumida, último registro, desafio ativo e atalhos para criar/entrar
   em grupo. No desktop, resumo e grupos podem ocupar colunas distintas.
2. **Onboarding progressivo.** Para uma conta nova, apresentar três ações claras:
   criar/entrar em grupo, registrar a primeira atividade e entender a pontuação.
   O estado desaparece conforme as ações são concluídas.
3. **Retomar de onde parou.** Destacar o último grupo acessado ou registrado, sem
   mensagens de culpa, urgência artificial ou contadores de perda.
4. **Busca rápida.** Se a lista crescer, permitir localizar grupos e registros a
   partir da home, mantendo listas finitas.

### 3. Grupos e convites

1. **Ciclo completo de membros.** Permitir sair do grupo, remover membro e
   transferir o único papel de administrador em uma transação. O administrador
   não pode sair sem transferir ou encerrar o grupo.
2. **Convite direto.** Convidar uma conta existente por e-mail/identificador,
   consultar pendentes, cancelar e aceitar/recusar. O código compartilhável atual
   continua como alternativa.
3. **Gestão do grupo.** Separar configurações, membros e convites em seções claras;
   mostrar quem administra e quando o grupo encerra.
4. **Encerramento explícito.** Permitir encerrar antes da data com confirmação e
   apresentar o pódio final em modo somente leitura.
5. **Foto com mais controle.** Além de substituir, permitir remover e reposicionar
   a foto de capa.

### 4. Registros e fotos

1. **Busca e filtros.** Filtrar por período, hobby, participante e grupo, com
   paginação preservada e parâmetros compartilháveis na URL.
2. **Reações simples.** Começar por uma reação por usuário/registro, contagem e
   remoção idempotente. Comentários podem ser avaliados só depois, pois elevam
   bastante moderação, privacidade e complexidade.
3. **Compartilhamento.** Gerar um card ou link do registro respeitando a
   privacidade do grupo; não expor fotos privadas por URL pública acidentalmente.
4. **Edição de mídia.** Recorte e compressão no cliente para melhorar a composição
   e reduzir upload, mantendo a validação e o reprocessamento no servidor.
5. **Rascunho local.** Preservar campos e pré-visualização quando a rede falhar ou
   a pessoa sair sem querer, sem armazenar permanentemente dados sensíveis.

### 5. Ranking

1. **Explicar empates e pontuação.** Exibir a regra competitiva (`1, 1, 3`) e um
   resumo de como os pontos do usuário foram formados.
2. **Movimento de posição.** Comparar com um marco anterior (semana ou último
   acesso) sem criar urgência; exige snapshots ou consulta histórica definida.
3. **Pódio final.** Congelar visualmente o resultado de grupos encerrados e ligar
   esse resultado às conquistas correspondentes.
4. **Filtros de período.** Oferecer “total” e intervalos somente se a regra do
   produto deixar claro que o ranking oficial continua sendo o total do grupo.

### 6. Perfil e configurações

1. **Estatísticas reais.** Total de registros, minutos, hobbies praticados,
   participação em grupos, pontos por grupo e evolução por período.
2. **Histórico de grupos.** Mostrar grupos encerrados ou abandonados e a posição
   final, sem misturá-los aos grupos ativos.
3. **Segurança da conta.** Alterar senha, alterar e confirmar novo e-mail, listar
   sessões e exportar os próprios dados.
4. **Preferências.** Reunir privacidade, notificações consentidas, acessibilidade e
   eventual meta de tempo de tela em vez de mostrar módulos ainda vazios.

### 7. Gamificação

1. **Conquistas calculadas.** Implementar avaliação idempotente dos critérios já
   modelados, data de conquista e detalhe do progresso.
2. **Desafios semanais.** Escolha entre opções, progresso calculado pelos logs,
   expiração e conclusão sem mensagens de culpa.
3. **Desafios de grupo.** Permitir que o administrador configure desafios dentro
   de limites previsíveis e com pontuação persistida.
4. **Metas pessoais.** Manter metas privadas e sem impacto no ranking; a interface
   deve privilegiar acompanhamento, não punição.

### 8. Visual, responsividade e marca

1. **Responsividade para telas maiores.** Preservar o mobile a partir de 360 px,
   criar composição para tablet a partir de aproximadamente `48rem` e desktop a
   partir de `72rem`. Em vez do efeito de “celular ampliado”, usar grade de duas
   colunas onde houver relação clara: resumo + grupos na home, conteúdo + painel
   lateral no grupo e foto + dados em detalhes. Limitar comprimento de texto e
   testar também zoom de 200%, teclado e orientação paisagem.
2. **Logo e sistema de marca.** Criar símbolo, wordmark “Hobyn”, versão reduzida,
   monocromática e para fundo escuro. Entregar em SVG otimizado e definir área de
   proteção, tamanhos mínimos e uso em login, cadastro, cabeçalho, favicon e
   apresentação. A marca deve conversar com o neobrutalismo suave e a linguagem
   retrô sem depender de baixa resolução.
3. **Vetores/ilustrações.** Criar uma família pequena e coerente de SVGs para:
   boas-vindas, nenhum grupo, nenhum registro, convite, conquista e erro de rede.
   Reutilizar a paleta existente, bordas firmes e formas simples. Ilustração
   decorativa usa `aria-hidden`; quando comunica estado, precisa de texto
   equivalente. Evitar arquivos grandes ou uma ilustração diferente em cada card.
4. **Home mais atraente.** Combinar o dashboard funcional com uma área de marca,
   um vetor de destaque e hierarquia melhor entre ação principal, grupos e resumo.
5. **Polimento de estados.** Padronizar skeleton/carregamento, sucesso, erro,
   vazio e confirmação destrutiva em todos os módulos.
6. **Acessibilidade visual.** Conferir contraste dos novos vetores, foco, ordem de
   leitura, texto alternativo, redução de movimento e ausência de informação que
   dependa somente de cor.

### 9. Plataforma, qualidade e operação

1. **Armazenamento de mídia externo.** Substituir o filesystem local por um
   adaptador S3 compatível, com URLs privadas/assinadas, limpeza e backup.
2. **Observabilidade.** Logs estruturados, identificador de requisição, captura de
   erros e métricas de latência sem registrar tokens, senhas ou fotos.
3. **E2E.** Quando retomado, cobrir caminho feliz com dois usuários, recuperação de
   senha, responsividade, upload, convites, ranking e falhas reais de rede.
4. **PWA/offline.** Começar pelo shell instalável e leitura cacheada; criação
   offline só deve entrar com fila, deduplicação e resolução clara de conflito.

## Ordem sugerida de execução

### Onda 1 — confiança e acabamento do produto

1. Confirmação de senha no cadastro.
2. Recuperação e alteração de senha.
3. Ciclo de membros/administração dos grupos.
4. Nova home e responsividade de tablet/desktop.
5. Logo e primeira coleção de vetores aplicada aos estados vazios principais.

### Onda 2 — valor recorrente

1. Estatísticas de perfil e filtros de registros.
2. Conquistas e desafios.
3. Pódio final e explicações do ranking.
4. Convites diretos.

### Onda 3 — social e produção

1. Reações e compartilhamento controlado.
2. Preferências e notificações consentidas.
3. Mídia externa, observabilidade e PWA.

Antes de iniciar qualquer item, transformar sua linha em uma tarefa com escopo,
critério de aceite e testes. A existência nesta lista não autoriza ampliar uma
entrega em andamento para incluir automaticamente as melhorias seguintes.
