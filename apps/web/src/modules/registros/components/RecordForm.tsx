import { useMemo, useState, type FormEvent } from 'react';
import { recordSchemas } from 'shared';
import { Button, ChipGroup, PhotoField, SelectField, TextArea, TextField } from '../../../components/common';
import type { Grupo, Hobby, Registro, RegistroFormInput } from '../../../types/domain';
import { fullName, todayISODate } from '../../../utils/format';
import styles from './RecordForm.module.css';

interface RecordFormProps {
  grupos: Grupo[];
  /** Catálogo global de hobbies (inclui "Outro"). */
  catalogo: Hobby[];
  initialGroupId?: string;
  initialRecord?: Registro;
  error?: string;
  currentUserId: string;
  onSubmit: (input: RegistroFormInput) => void | Promise<void>;
}

type Errors = Partial<Record<'grupo' | 'hobby' | 'data' | 'duracao' | 'foto', string>>;

export function RecordForm({ grupos, catalogo, initialGroupId, initialRecord, currentUserId, onSubmit, error }: RecordFormProps) {
  const [grupoId, setGrupoId] = useState(() => initialRecord?.grupoId ?? grupos.find((g) => g.id === initialGroupId)?.id ?? grupos[0]?.id ?? '');
  const [hobbyChoice, setHobbyChoice] = useState(initialRecord?.hobby.id ?? '');
  const [data, setData] = useState(initialRecord?.data ?? todayISODate());
  const [duracao, setDuracao] = useState(initialRecord ? String(initialRecord.duracaoMinutos) : '');
  const [foto, setFoto] = useState<File | null>(null);
  const [descricao, setDescricao] = useState(initialRecord?.descricao ?? '');
  const [participantes, setParticipantes] = useState<string[]>(initialRecord?.autores.filter(autor => autor.id !== currentUserId).map(autor => autor.id) ?? []);
  const [photoError, setPhotoError] = useState<string>();
  const [validation, setValidation] = useState<string>();
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);

  const grupo = grupos.find((g) => g.id === grupoId);

  // Regra de hobbies: lista vazia libera o catálogo todo (com "Outro"); com lista, só ela.
  const hobbies = useMemo(
    () => (!grupo ? [] : grupo.hobbiesPermitidos.length > 0 ? grupo.hobbiesPermitidos : catalogo),
    [grupo, catalogo],
  );
  // Grupo com um único hobby vem com ele pré-selecionado.
  const hobbyId = hobbies.some((h) => h.id === hobbyChoice) ? hobbyChoice : hobbies.length === 1 ? hobbies[0].id : '';

  const outrosMembros = grupo?.membros.filter((m) => m.id !== currentUserId) ?? [];
  const participanteIds = participantes.filter((id) => outrosMembros.some((m) => m.id === id));

  const hobbyHint = !grupo
    ? undefined
    : grupo.hobbiesPermitidos.length === 1
      ? `Este grupo aceita só ${grupo.hobbiesPermitidos[0].nome}.`
      : grupo.hobbiesPermitidos.length === 0
        ? 'Não achou o seu hobby? Escolha "Outro".'
        : undefined;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (submitting || photoError) return;
    const minutos = Number(duracao);
    const result = recordSchemas.createFields.safeParse({ groupId: grupoId, hobbyId, data, duracaoMinutos: minutos, descricao, userIds: [currentUserId, ...participanteIds] });
    const next: Errors = {};
    if (!grupo) next.grupo = 'Escolha um grupo.';
    if (!foto && !initialRecord) next.foto = 'A foto é obrigatória.';
    if (!result.success) {
      const map: Record<string, keyof Errors> = { groupId: 'grupo', hobbyId: 'hobby', data: 'data', duracaoMinutos: 'duracao' };
      for (const issue of result.error.issues) {
        const field = map[String(issue.path[0])];
        if (field) next[field] = issue.message;
      }
      setValidation(result.error.issues[0].message);
    } else setValidation(undefined);
    setErrors(next);
    if (!grupo || !result.success || Object.keys(next).length) return;

    setSubmitting(true);
    try {
      await onSubmit({ grupoId: grupo.id, hobbyId, data, duracaoMinutos: minutos, foto, descricao: descricao.trim(), participanteIds });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      {(error || validation) && <p role="alert">{error || validation}</p>}
      <SelectField
        label="Grupo"
        disabled={!!initialRecord}
        value={grupoId}
        onChange={(e) => setGrupoId(e.target.value)}
        options={grupos.map((g) => ({ value: g.id, label: g.nome }))}
        error={errors.grupo}
        hint={
          grupo?.limiteRegistrosPorDia
            ? `Este grupo conta até ${grupo.limiteRegistrosPorDia} registros por dia para pontuar. Os extras ficam salvos, mas não somam pontos.`
            : undefined
        }
      />
      <SelectField
        label="Hobby"
        value={hobbyId}
        onChange={(e) => setHobbyChoice(e.target.value)}
        options={hobbies.map((h) => ({ value: h.id, label: h.nome }))}
        placeholder="Escolha um hobby"
        error={errors.hobby}
        hint={hobbyHint}
      />
      <TextField label="Dia da atividade" type="date" value={data} max={todayISODate()} onChange={(e) => setData(e.target.value)} error={errors.data} />
      <TextField
        label="Duração em minutos"
        type="number"
        inputMode="numeric"
        min={1}
        max={1440}
        value={duracao}
        onChange={(e) => setDuracao(e.target.value)}
        error={errors.duracao}
        hint={
          grupo?.modoPontuacao === 'tempo'
            ? 'Neste grupo os pontos vêm do tempo: a cada 30 min completos. Minutos que sobram não contam.'
            : 'Neste grupo cada registro vale a mesma pontuação, não importa a duração.'
        }
      />
      <PhotoField label="Foto da atividade" hint={initialRecord ? 'Envie outra foto para substituir a atual. JPEG, PNG ou WebP, até 10 MB.' : 'Obrigatória. JPEG, PNG ou WebP, até 10 MB.'} optional={!!initialRecord} existingSrc={initialRecord?.foto} value={foto} onChange={setFoto} onError={setPhotoError} error={errors.foto} />
      <TextArea label="Descrição" optional value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Como foi?" />
      {outrosMembros.length > 0 && (
        <ChipGroup
          legend="Fez junto com alguém?"
          optional
          options={outrosMembros.map((m) => ({ value: m.id, label: fullName(m) }))}
          values={participanteIds}
          onChange={setParticipantes}
          hint="Quem você marcar também ganha pontos, com bônus de cooperação. Não precisa de confirmação."
        />
      )}
      <Button type="submit" variant="primary" fullWidth disabled={submitting || !!photoError}>
        {submitting ? 'Salvando…' : initialRecord ? 'Salvar alterações' : 'Salvar registro'}
      </Button>
    </form>
  );
}
