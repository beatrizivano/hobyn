import { useState, type FormEvent } from 'react';
import { groupSchemas } from 'shared';
import { Button, ChipGroup, ChoiceGroup, PhotoField, SelectField, TextArea, TextField } from '../../../components/common';
import type { Grupo, Hobby, ModoPontuacao, NovoGrupoInput } from '../../../types/domain';
import { todayISODate } from '../../../utils/format';
import styles from './GroupForm.module.css';

interface GroupFormProps {
  catalogo: Hobby[];
  error?: string;
  initialValues?: Grupo;
  onSubmit: (input: NovoGrupoInput) => void | Promise<void>;
}

const LIMIT_OPTIONS = [1, 2, 3, 4, 5].map((n) => ({ value: String(n), label: `${n} por dia` }));

export function GroupForm({ catalogo, onSubmit, error, initialValues }: GroupFormProps) {
  const [nome, setNome] = useState(initialValues?.nome ?? '');
  const [descricao, setDescricao] = useState(initialValues?.descricao ?? '');
  const [foto, setFoto] = useState<File | null>(null);
  const [photoError, setPhotoError] = useState<string>();
  const [validation, setValidation] = useState<string>();
  const [hobbyIds, setHobbyIds] = useState<string[]>(initialValues?.hobbiesPermitidos.map(hobby => hobby.id) ?? []);
  const [modo, setModo] = useState<ModoPontuacao>(initialValues?.modoPontuacao ?? 'registro');
  const [limite, setLimite] = useState(initialValues?.limiteRegistrosPorDia ? String(initialValues.limiteRegistrosPorDia) : '');
  const [endsAt, setEndsAt] = useState(() => initialValues?.endsAt ? new Date(initialValues.endsAt).toLocaleDateString('en-CA') : '');
  const [submitting, setSubmitting] = useState(false);

  // "Outro" não é escolhido aqui: ele aparece sozinho em grupos sem restrição de hobbies.
  const escolhiveis = catalogo.filter((hobby) => hobby.nome !== 'Outro');

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (submitting) return;
    if (photoError) { setValidation(photoError); return; }
    setSubmitting(true);
    try {
      const input = {
        nome: nome.trim(),
        descricao: descricao.trim(),
        foto,
        hobbyIds,
        modoPontuacao: modo,
        limiteRegistrosPorDia: limite ? Number(limite) : null,
        endsAt: endsAt ? new Date(`${endsAt}T23:59:59`).toISOString() : null,
      };
      const { foto: _foto, ...fields } = input;
      const result = groupSchemas.createFields.safeParse(fields);
      if (!result.success) { setValidation(result.error.issues[0].message); return; }
      setValidation(undefined);
      await onSubmit({ ...input, ...result.data, descricao: result.data.descricao, foto });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      {(error || validation) && <p role="alert">{error || validation}</p>}
      <TextField label="Nome do grupo" value={nome} onChange={(e) => setNome(e.target.value)} autoComplete="off" />
      <TextArea label="Descrição" value={descricao} onChange={(e) => setDescricao(e.target.value)} />
      <PhotoField label="Foto do grupo" optional value={foto} existingSrc={initialValues?.foto} onChange={setFoto} onError={setPhotoError} ratio="4 / 3" />
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
        {submitting ? 'Salvando…' : initialValues ? 'Salvar configurações' : 'Criar grupo'}
      </Button>
    </form>
  );
}
