import { Avatar, PhotoFrame, Tag } from '../../../components/common';
import type { Registro } from '../../../types/domain';
import { formatDuration, formatLongDate, fullName } from '../../../utils/format';
import { hobbyTone } from '../../../utils/hobbyTone';
import { RecordActions } from './RecordActions';
import styles from './RecordDetail.module.css';

interface RecordDetailProps {
  registro: Registro;
}

/** Registro completo: foto, tags, descrição, quem postou e data. */
export function RecordDetail({ registro }: RecordDetailProps) {
  return (
    <article className={styles.detail}>
      <PhotoFrame src={registro.foto} alt={`Foto do registro de ${registro.hobby.nome}`} ratio="4 / 3" />
      <div className={styles.tags}>
        <Tag tone={hobbyTone(registro.hobby.nome)}>{registro.hobby.nome}</Tag>
        <Tag>{formatDuration(registro.duracaoMinutos)}</Tag>
        {registro.autores.length > 1 && <Tag>Em conjunto</Tag>}
      </div>
      {registro.descricao && <p className={styles.description}>{registro.descricao}</p>}
      <ul className={styles.authors}>
        {registro.autores.map((autor) => (
          <li key={autor.id} className={styles.author}>
            <Avatar name={fullName(autor)} src={autor.fotoDePerfil} size="lg" />
            <div>
              <p className={styles.name}>{fullName(autor)}</p>
              <p className={styles.date}>{formatLongDate(registro.data)}</p>
            </div>
          </li>
        ))}
      </ul>
      <RecordActions recordId={registro.id} curtidas={registro.curtidas} />
    </article>
  );
}
