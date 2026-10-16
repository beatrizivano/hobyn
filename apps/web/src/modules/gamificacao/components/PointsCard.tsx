import { Card } from '../../../components/common';
import { formatPoints } from '../../../utils/format';
import styles from './PointsCard.module.css';

interface PointsCardProps {
  total: number;
  desafiosConcluidos: number;
}

/**
 * Soma exibida só como resumo pessoal. A pontuação que vale para ranking
 * continua sendo por grupo (ver REGRAS_DE_NEGÓCIO.md, seção 4).
 */
export function PointsCard({ total, desafiosConcluidos }: PointsCardProps) {
  return (
    <Card tone="dark" className={styles.card}>
      <p className={styles.points}>{formatPoints(total)}</p>
      <p className={styles.detail}>
        {desafiosConcluidos} {desafiosConcluidos === 1 ? 'desafio concluído' : 'desafios concluídos'}
      </p>
      <p className={styles.note}>Pontos somados de todos os seus grupos</p>
    </Card>
  );
}
