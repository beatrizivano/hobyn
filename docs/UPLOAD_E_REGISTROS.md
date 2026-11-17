# Upload de fotos e registros

## Fluxo implementado

Criar, consultar, editar e excluir registros pela web, com foto obrigatória,
participantes do próprio grupo e atualização do feed após as mutações.
Arquivos inválidos são informados no formulário; os valores digitados permanecem
preenchidos quando a API rejeita a gravação.

## Contrato HTTP

Todas as rotas exigem o Bearer token e uma sessão ativa.

| Método e rota | Entrada e comportamento |
| --- | --- |
| `POST /api/records` | Multipart com uma foto real no campo `foto`; cria registro e logs de pontos na mesma transação. |
| `GET /api/records?groupId=...&take=20&cursor=...` | Feed com `items` e `nextCursor`, acessível apenas a membros. |
| `GET /api/records/:recordId` | Detalhe acessível a membros ativos. |
| `GET /api/records/:recordId/photo` | Retorna WebP binário, com autorização por grupo e `Cache-Control: private, no-store`. |
| `PATCH /api/records/:recordId` | Apenas o autor, em grupo ativo. Multipart permite substituir a foto; JSON permite editar somente os metadados. |
| `DELETE /api/records/:recordId` | Apenas o autor, em grupo ativo. Remove registro e arquivo; preserva os pontos históricos. |

Campos textuais da criação: `groupId`, `hobbyId`, `data` (`YYYY-MM-DD`),
`duracaoMinutos` (inteiro de 1 a 1440), `descricao` opcional e `userIds` opcional.
No multipart, `userIds` é uma string JSON com a lista dos participantes, incluindo
o autor. Se omitida, a API usa apenas o autor. Participantes repetidos, externos
ou inativos são rejeitados. O hobby precisa estar ativo e ser permitido no grupo.
Na edição, o grupo não pode ser alterado e a foto existente é mantida se nenhum
arquivo novo for enviado.

Enviar somente uma string `foto` ou um caminho inventado não cria um registro.
A resposta expõe a rota privada da foto; o caminho de armazenamento é interno.
O cliente HTTP da web lê a imagem autenticada como Blob e revoga sua URL local
quando ela deixa de ser usada.

## Formato e armazenamento

- Fotos estáticas JPEG, PNG ou WebP, até 10 MiB e 40 megapixels.
- O conteúdo é decodificado e validado, além da conferência do tipo declarado.
- A orientação é aplicada e a foto é reprocessada em WebP sem metadados.
- Nomes aleatórios substituem o nome original do arquivo.
- O diretório padrão é `apps/api/storage/uploads`, ignorado pelo Git.
- `UPLOAD_DIR` pode indicar outro diretório persistente; caminhos relativos são
  resolvidos a partir de `apps/api`.

Os arquivos sobrevivem à reinicialização da API. Para mudar de computador ou
hospedagem, transfira tanto o banco quanto esse diretório. Se a API for colocada
em Docker, monte esse diretório em um volume persistente. Fotos não ficam em uma
pasta pública servida diretamente pelo Express.

Falhas de negócio ou de transação removem a foto recém-gravada. Substituição e
exclusão limpam a foto anterior após a confirmação no banco. Erros de limpeza do
filesystem são registrados no servidor. Edições e exclusões não recalculam nem
apagam os logs de pontuação. Grupos encerrados permitem leitura das fotos, mas
bloqueiam novas atividades, edições e exclusões.

## Pontuação e testes

Registros excedentes ao limite diário são salvos com foto e permanecem no feed,
mas os participantes que atingiram o limite não recebem novos pontos. A web
exibe esse aviso depois do envio. Participantes cooperativos são pontuados de
forma individual, conforme a regra e o multiplicador persistidos no banco.
Conflitos de transação retornam `409` para uma nova tentativa explícita.

```powershell
corepack pnpm test
corepack pnpm test:records
corepack pnpm test:integration
corepack pnpm typecheck
corepack pnpm lint
corepack pnpm build
```

`test:records` usa MySQL local e um servidor HTTP temporário em porta livre, com
fotos em diretório temporário. Testa formatos, conteúdo falso, tamanho, acesso
cruzado, persistência após recriar o servidor, cooperação, limite diário,
paginação, edição, substituição, exclusão, concorrência e rollback com limpeza.
A associação de um segundo membro é uma fixture de teste; não implementa convites.

`test:integration` exige API e Vite em execução e usa os services reais da web,
incluindo criação multipart, leitura binária autenticada, edição e exclusão.
A validação visual e o E2E em navegador ainda precisam ser conferidos.
