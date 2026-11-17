# Fotos de perfil e grupo

Perfis e grupos aceitam uma foto opcional JPEG, PNG ou WebP de até 10 MiB.
O servidor valida o conteúdo real, limita a imagem a 40 megapixels, aplica a
orientação, remove metadados e grava somente uma versão WebP reprocessada.

Os arquivos ficam em `UPLOAD_DIR` (por padrão `apps/api/storage/uploads`), nas
pastas `profiles/` e `groups/`. O banco armazena apenas uma chave interna; as
respostas HTTP expõem URLs privadas e versionadas, nunca caminhos do filesystem.

## Contrato HTTP

| Método | Rota | Acesso |
| --- | --- | --- |
| `PATCH` | `/api/users/me` | própria conta; `multipart/form-data`, arquivo opcional `foto` |
| `GET` | `/api/users/:userId/photo` | qualquer usuário autenticado; somente conta ativa com foto |
| `POST` | `/api/groups` | usuário autenticado; arquivo opcional `foto` |
| `PATCH` | `/api/groups/:groupId` | administrador ativo; arquivo opcional `foto` |
| `GET` | `/api/groups/:groupId/photo` | membro ativo do grupo |

Os demais campos continuam validados pelos schemas compartilhados. Valores de
chave como `profiles/...` ou `groups/...` enviados pelo cliente são rejeitados:
somente o pipeline de upload pode definir essas referências.

Ao substituir uma foto, o arquivo novo é removido se a gravação no banco falhar;
depois do sucesso, o anterior é apagado. Excluir a conta ou o grupo também limpa
a foto correspondente. URLs incluem a revisão do registro para que a interface
não mantenha um blob antigo depois da troca.

## Verificação

```powershell
corepack pnpm test
corepack pnpm test:profile-group-photos
corepack pnpm typecheck
corepack pnpm lint
corepack pnpm build
```

O teste de integração usa MySQL local, servidor HTTP e diretório temporários. Ele
cobre formatos, leitura autenticada, autorização de grupo, substituição, conteúdo
inválido e limpeza nas exclusões. O módulo reutiliza colunas existentes e não
exige migration.
