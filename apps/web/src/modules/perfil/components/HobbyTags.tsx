import { Tag } from '../../../components/common';
import type { Hobby } from '../../../types/domain';
import { hobbyTone } from '../../../utils/hobbyTone';
import styles from './HobbyTags.module.css';

interface HobbyTagsProps {
  hobbies: Hobby[];
}

export function HobbyTags({ hobbies }: HobbyTagsProps) {
  if (hobbies.length === 0) {
    return <p className={styles.empty}>Seus hobbies aparecem aqui depois do primeiro registro.</p>;
  }
  return (
    <ul className={styles.list}>
      {hobbies.map((hobby) => (
        <li key={hobby.id}>
          <Tag tone={hobbyTone(hobby.nome)}>{hobby.nome}</Tag>
        </li>
      ))}
    </ul>
  );
}
