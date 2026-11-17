# Melhorias opcionais após o MVP

Implementar apenas se houver tempo depois dos fluxos centrais. Esta lista não
amplia os critérios de entrega do MVP.

| Melhoria | Situação atual | Critério para considerar concluída |
| --- | --- | --- |
| Coordenar sessão entre abas | Cada aba já compartilha um único refresh entre suas próprias requisições, mas não coordena a rotação com outras abas. | Duas abas renovam sem disputar o cookie; logout em uma é refletido na outra. |
| Limitar tentativas de login | Login ainda não possui limite de tentativas. Pode ser adiado na demonstração local. | Tentativas excessivas recebem uma resposta previsível, sem bloquear permanentemente o usuário. Priorizar antes de disponibilizar publicamente. |
| Ampliar testes E2E de autenticação | Há testes unitários e smoke HTTP; validação completa em navegador ainda está pendente. | Cobrir cenários adicionais de múltiplas abas, logout durante refresh, indisponibilidade de rede e cookies no ambiente publicado. |

A validação básica de cadastro, login, restauração da sessão, refresh, logout e
acesso privado continua fazendo parte da verificação do MVP.

A associação do JWT à sessão e o bloqueio de sessões revogadas/expiradas são
tratados no middleware atual, fora desta lista de melhorias opcionais.
