import { useNavigate } from 'react-router-dom';
import { Avatar, Button, Card, Tag } from '../../../components/common';
import { useLeaveGroup, useRemoveGroupMember } from '../../../hooks/useGrupos';
import type { Grupo } from '../../../types/domain';
import { fullName } from '../../../utils/format';
import styles from './GroupMembersPanel.module.css';

export function GroupMembersPanel({ grupo, currentUserId, ended }: { grupo: Grupo; currentUserId: string; ended: boolean }) {
  const leave = useLeaveGroup(grupo.id);
  const remove = useRemoveGroupMember(grupo.id);
  const navigate = useNavigate();
  const isAdmin = grupo.meuPapel === 'admin';
  async function leaveGroup() {
    if (leave.isPending || remove.isPending) return;
    const message = isAdmin ? 'Sair do grupo? A administração será transferida automaticamente para o membro mais antigo.' : 'Sair do grupo? Seus registros e pontos históricos serão preservados.';
    if (!window.confirm(message)) return;
    try { await leave.mutateAsync(); navigate('/', { replace: true }); } catch { /* Erro exibido abaixo. */ }
  }
  async function removeMember(userId: string, name: string) {
    if (leave.isPending || remove.isPending) return;
    if (!window.confirm(`Remover ${name} do grupo? O histórico de registros será preservado.`)) return;
    try { await remove.mutateAsync(userId); } catch { /* Erro exibido abaixo. */ }
  }
  return <Card as="section" className={styles.panel}>
    <h2>Membros</h2>
    <ul className={styles.list}>{grupo.membros.map(member => <li key={member.id} className={styles.member}>
      <Avatar name={fullName(member)} src={member.fotoDePerfil} />
      <span className={styles.name}>{fullName(member)} {member.id === currentUserId && <Tag>Você</Tag>} {member.papel === 'admin' && <Tag>Admin</Tag>}</span>
      {isAdmin && member.id !== currentUserId && member.papel !== 'admin' && !ended && <Button variant="ghost" disabled={leave.isPending || remove.isPending} onClick={() => void removeMember(member.id, fullName(member))}>{remove.isPending ? 'Removendo…' : 'Remover'}</Button>}
    </li>)}</ul>
    {(leave.error || remove.error) && <p role="alert">{leave.error?.message ?? remove.error?.message}</p>}
    {!ended && <><Button variant="ghost" disabled={leave.isPending || remove.isPending || (isAdmin && grupo.membros.length < 2)} onClick={() => void leaveGroup()}>{leave.isPending ? 'Saindo…' : 'Sair do grupo'}</Button>{isAdmin && grupo.membros.length < 2 && <small>Convide outra pessoa antes de sair ou exclua o grupo.</small>}</>}
  </Card>;
}
