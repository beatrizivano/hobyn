import { useState, type FormEvent } from 'react';
import { Button, ChipGroup, ChoiceGroup, PhotoField, SelectField, TextArea, TextField } from '../../../components/common';
import type { Hobby, ModoPontuacao, NovoGrupoInput } from '../../../types/domain';
import { todayISODate } from '../../../utils/format';
import styles from './GroupForm.module.css';

interface GroupFormProps {
  catalogo: Hobby[];
  onSubmit: (input: NovoGrupoInput) => void | Promise<void>;
}

const LIMIT_OPTIONS = [1, 2, 3, 4, 5].map((n) => ({ value: String(n), label: `${n} por dia` }));

export function GroupForm({ catalogo, onSubmit }: GroupFormProps) {
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [foto, setFoto] = useState<File | null>(null);
  const [hobbyIds, setHobbyIds] = useState<string[]>([]);
  const [modo, setModo] = useState<ModoPontuacao>('registro');
  const [limite, setLimite] = useState('');
  const [endsAt, setEndsAt] = useState('');
  const [nomeError, setNomeError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);

  // "Outro" não é escolhido aqui: ele aparece sozinho em grupos sem restrição de hobbies.
  const escolhiveis = catalogo.filter((hobby) => hobby.nome !== 'Outro');

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (nome.trim().length < 2) {
      setNomeError('Dê um nome ao grupo, com pelo menos 2 letras.');
      return;
    }
    setNomeError(undefined);
    setSubmitting(true);
    try {
      await onSubmit({
        nome: nome.trim(),
        descricao: descricao.trim(),
        foto,
        hobbyIds,
        modoPontuacao: modo,
        limiteRegistrosPorDia: limite ? Number(limite) : null,
        endsAt: endsAt ? new Date(`${endsAt}T23:59:59`).toISOString() : null,
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <TextField label="Nome do grupo" value={nome} onChange={(e) => setNome(e.target.value)} error={nomeError} autoComplete="off" />
      <TextArea label="Descrição" optional value={descricao} onChange={(e) => setDescricao(e.target.value)} />
      <PhotoField label="Foto do grupo" optional value={foto} onChange={setFoto} ratio="16 / 9" />
      <ChipGroup
        legend="Hobbies permitidos"
        optional
        options={escolhiveis.map((hobby) => ({ value: hobby.id, label: hobby.nome }))}
        values={hobbyIds}
        onChange={setHobbyIds}
        hint={
          hobbyIds.length === 0
            ? 'Sem seleção, todos os hobbies ficam liberados, incluindo "Outro".'
            : hobbyIds.length === 1
              ? 'Com um só hobby, ele já vem escolhido ao registrar.'
              : undefined
        }
      />
      <ChoiceGroup<ModoPontuacao>
        legend="Como os pontos são contados"
        name="modoPontuacao"
        value={modo}
        onChange={setModo}
        options={[
          { value: 'registro', label: 'Por registro', description: 'Cada registro vale a mesma pontuação, não importa o tempo.' },
          { value: 'tempo', label: 'Por tempo', description: 'Os pontos crescem a cada 30 minutos completos de atividade.' },
        ]}
      />
      <SelectField
        label="Limite de registros que pontuam"
        optional
        value={limite}
        onChange={(e) => setLimite(e.target.value)}
        placeholder="Sem limite"
        options={LIMIT_OPTIONS}
        hint="Registros além do limite ficam salvos, mas não somam pontos."
      />
      <TextField
        label="Data final"
        optional
        type="date"
        min={todayISODate()}
        value={endsAt}
        onChange={(e) => setEndsAt(e.target.value)}
        hint="Sem data final, o grupo continua sem prazo."
      />
      <Button type="submit" variant="primary" fullWidth disabled={submitting}>
        {submitting ? 'Criando…' : 'Criar grupo'}
      </Button>
    </form>
  );
}
