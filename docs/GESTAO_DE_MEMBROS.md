# Saída e remoção de membros

Sair ou ser removido de um grupo encerra apenas a associação ativa, preenchendo
`usuarioGrupo.saiuEm`. Registros, participantes, fotos e `logAtividades` não são
apagados nem recalculados. A pessoa deixa de aparecer no ranking ao vivo e perde
acesso ao grupo, mas seu histórico permanece íntegro.

## Regras

- Qualquer membro ativo pode sair de um grupo ainda aberto.
- Somente o administrador ativo pode remover outro membro.
- O administrador não remove a si próprio; deve usar “Sair do grupo”.
- Quando o administrador sai, o sistema promove automaticamente o membro ativo
  com `entrouEm` mais antigo. Em empate, o ID da associação define a ordem.
- Se não houver sucessor, a saída é bloqueada; o administrador deve convidar
  alguém ou excluir o grupo.
- Grupos encerrados permanecem somente para leitura e não aceitam mudanças de
  associação.
- Todas as escritas usam transação serializável e repetem conflitos concorrentes.

## Endpoints

| Método | Rota | Resultado |
| --- | --- | --- |
| `POST` | `/api/groups/:groupId/leave` | encerra a associação; informa `newAdminId` quando há sucessão |
| `DELETE` | `/api/groups/:groupId/members/:userId` | administrador encerra a associação do membro |

A página do grupo lista membros e papéis. O botão de remoção aparece somente para
o administrador e nunca para ele próprio. A saída exige confirmação e informa
quando haverá transferência automática.

## Verificação

```powershell
corepack pnpm test
corepack pnpm test:memberships
corepack pnpm typecheck
corepack pnpm lint
corepack pnpm build
```

O teste integrado verifica autorização, escolha do membro mais antigo, perda de
acesso, bloqueio sem sucessor e preservação de registro, participante e pontuação.
O recurso usa `saiuEm` e não exige migration.
