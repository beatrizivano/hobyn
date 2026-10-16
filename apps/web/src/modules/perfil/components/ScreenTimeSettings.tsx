import { useState, type FormEvent } from 'react';
import { Button, TextField } from '../../../components/common';
import styles from './ScreenTimeSettings.module.css';

interface ScreenTimeSettingsProps {
  /** Meta diária atual em minutos; nula = sem meta. */
  goalMinutes: number | null;
  onSaveGoal: (minutes: number | null) => void | Promise<void>;
  onSaveToday: (minutes: number) => void | Promise<void>;
}

const parseMinutes = (value: string) => {
  const n = Number(value);
  return Number.isInteger(n) && n >= 0 && n <= 1440 ? n : null;
};

/**
 * Meta de tempo de tela e registro manual do dia. Tudo opcional: sem meta,
 * a conquista "Concentrado" nem é avaliada e nada é cobrado do usuário.
 */
export function ScreenTimeSettings({ goalMinutes, onSaveGoal, onSaveToday }: ScreenTimeSettingsProps) {
  const [goal, setGoal] = useState(goalMinutes?.toString() ?? '');
  const [today, setToday] = useState('');
  const [goalError, setGoalError] = useState<string>();
  const [todayError, setTodayError] = useState<string>();
  const [feedback, setFeedback] = useState('');

  async function saveGoal(event: FormEvent) {
    event.preventDefault();
    if (goal.trim() === '') {
      setGoalError(undefined);
      await onSaveGoal(null);
      setFeedback('Meta removida.');
      return;
    }
    const minutes = parseMinutes(goal);
    if (minutes === null || minutes < 1) {
      setGoalError('Informe minutos por dia, de 1 a 1440.');
      return;
    }
    setGoalError(undefined);
    await onSaveGoal(minutes);
    setFeedback('Meta salva.');
  }

  async function saveToday(event: FormEvent) {
    event.preventDefault();
    const minutes = parseMinutes(today);
    if (minutes === null) {
      setTodayError('Informe os minutos de hoje, de 0 a 1440.');
      return;
    }
    setTodayError(undefined);
    await onSaveToday(minutes);
    setToday('');
    setFeedback('Tempo de hoje salvo.');
  }

  return (
    <div className={styles.wrapper}>
      <form className={styles.form} onSubmit={saveGoal} noValidate>
        <TextField
          label="Meta diária de tempo de tela, em minutos"
          optional
          type="number"
          inputMode="numeric"
          min={1}
          max={1440}
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          error={goalError}
          hint="Sem meta, nada é acompanhado."
        />
        <Button type="submit" fullWidth>Salvar meta</Button>
      </form>
      <form className={styles.form} onSubmit={saveToday} noValidate>
        <TextField
          label="Tempo de tela de hoje, em minutos"
          type="number"
          inputMode="numeric"
          min={0}
          max={1440}
          value={today}
          onChange={(e) => setToday(e.target.value)}
          error={todayError}
          hint="Você informa o valor; o app não mede o uso do aparelho."
        />
        <Button type="submit" fullWidth>Salvar tempo de hoje</Button>
      </form>
      <p className={styles.feedback} role="status">{feedback}</p>
    </div>
  );
}
