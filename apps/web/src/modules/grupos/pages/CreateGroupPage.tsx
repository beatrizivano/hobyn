import { useNavigate } from 'react-router-dom';
import { ScreenHeader, StateMessage } from '../../../components/common';
import { useHobbyCatalog } from '../../../hooks/useRegistros';
import type { NovoGrupoInput } from '../../../types/domain';
import { GroupForm } from '../components/GroupForm';
import styles from './CreateGroupPage.module.css';

export function CreateGroupPage() {
  const navigate = useNavigate();
  const catalog = useHobbyCatalog();

  if (catalog.isLoading) return <StateMessage kind="loading" />;
  if (!catalog.data) return <StateMessage kind="error">Não foi possível carregar os hobbies.</StateMessage>;

  async function handleSubmit(_input: NovoGrupoInput) {
    // TODO: grupos.service.create(_input); o criador entra como admin e a conquista "Líder" é checada no servidor.
    navigate('/');
  }

  return (
    <div className={styles.page}>
      <ScreenHeader title="Criar grupo" backTo="/" />
      <GroupForm catalogo={catalog.data} onSubmit={handleSubmit} />
    </div>
  );
}
