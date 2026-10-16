import { Avatar, Tag } from '../../../components/common';
import type { Membro } from '../../../types/domain';
import { fullName } from '../../../utils/format';
import styles from './MemberStack.module.css';

interface MemberStackProps {
  membros: Membro[];
  /** Quantos avatares mostrar antes do "+N". */
  max?: number;
}

export function MemberStack({ membros, max = 3 }: MemberStackProps) {
  const shown = membros.slice(0, max);
  const extra = membros.length - shown.length;
  return (
    <div className={styles.stack}>
      <ul className={styles.avatars}>
        {shown.map((membro) => (
          <li key={membro.id}>
            <Avatar name={fullName(membro)} src={membro.fotoDePerfil} size="sm" />
          </li>
        ))}
      </ul>
      {extra > 0 && (
        <Tag>
          <span aria-hidden="true">+{extra}</span>
          <span className="sr-only">e mais {extra} membros</span>
        </Tag>
      )}
    </div>
  );
}
