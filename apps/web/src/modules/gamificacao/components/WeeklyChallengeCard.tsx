import { Card, ProgressBar, Tag } from '../../../components/common';
import type { WeeklyChallengeState } from '../../../types/domain';
import { formatDeadline, formatDuration } from '../../../utils/format';
import { hobbyTone } from '../../../utils/hobbyTone';
import styles from './WeeklyChallengeCard.module.css';

interface WeeklyChallengeCardProps {
  value: WeeklyChallengeState;
  /** Chamado quando o usuário escolhe um dos dois desafios aleatórios (escolha imposta). */
  onChoose?: (desafioId: string) => void;
}

export function WeeklyChallengeCard({ value, onChoose }: WeeklyChallengeCardProps) {
  if (value.state === 'choose') {
    return (
      <Card as="section" tone="dotted" className={styles.card} aria-labelledby="choose-title">
        <h3 id="choose-title" className={styles.title}>Escolha seu desafio da semana</h3>
        <div className={styles.options}>
          {value.opcoes.map((opcao) => (
            <button key={opcao.id} type="button" className={styles.option} onClick={() => onChoose?.(opcao.id)}>
              <span className={styles.optionName}>{opcao.nome}</span>
              <span className={styles.optionText}>{opcao.descricao}</span>
            </button>
          ))}
        </div>
      </Card>
    );
  }

  const { desafio } = value;
  const progresso = desafio.progresso;
  // Só desafios aleatórios têm prazo; desafios do grupo não têm pressão de tempo.
  const deadline = desafio.tipo === 'aleatorio' && desafio.expiraEm ? formatDeadline(desafio.expiraEm) : null;

  return (
    <Card as="section" tone="dotted" className={styles.card} aria-labelledby="challenge-title">
      {desafio.hobby && <Tag tone={hobbyTone(desafio.hobby.nome)}>{desafio.hobby.nome}</Tag>}
      <h3 id="challenge-title" className={styles.title}>{desafio.nome}</h3>
      {progresso && (
        <>
          <ProgressBar value={progresso.atual} max={progresso.meta} label={`Progresso do desafio ${desafio.nome}`} />
          <p className={styles.text}>
            {formatDuration(progresso.atual)} de {formatDuration(progresso.meta)}
            {deadline && `, ${deadline}`}
          </p>
        </>
      )}
      {!progresso && deadline && <p className={styles.text}>{deadline}</p>}
    </Card>
  );
}
