import { createBrowserRouter } from 'react-router-dom';
import { ButtonLink, StateMessage } from '../components/common';
import { AppLayout } from '../layouts/AppLayout';
import { FocusLayout } from '../layouts/FocusLayout';
import { LoginPage, RegisterPage } from '../modules/auth';
import { BadgesPage } from '../modules/gamificacao';
import { CreateGroupPage, GroupPage, JoinGroupPage } from '../modules/grupos';
import { HomePage } from '../modules/home';
import { EditProfilePage, ProfilePage, SettingsPage } from '../modules/perfil';
import { NewRecordPage, RecordPage } from '../modules/registros';

/**
 * Duas famílias de layout:
 *  - AppLayout: telas principais, com rodapé de navegação.
 *  - FocusLayout: telas de tarefa (login, formulários, detalhe), sem rodapé.
 * TODO: proteger as rotas autenticadas (redirecionar para /login sem sessão).
 */
export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/grupos/:groupId', element: <GroupPage /> },
      { path: '/perfil', element: <ProfilePage /> },
      { path: '/conquistas', element: <BadgesPage /> },
      { path: '/configuracoes', element: <SettingsPage /> },
    ],
  },
  {
    element: <FocusLayout />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/cadastro', element: <RegisterPage /> },
      { path: '/grupos/novo', element: <CreateGroupPage /> },
      { path: '/grupos/entrar', element: <JoinGroupPage /> },
      { path: '/registros/novo', element: <NewRecordPage /> },
      { path: '/registros/:recordId', element: <RecordPage /> },
      { path: '/perfil/editar', element: <EditProfilePage /> },
      {
        path: '*',
        element: (
          <StateMessage kind="error" title="Página não encontrada" action={<ButtonLink to="/">Voltar ao início</ButtonLink>}>
            O endereço pode ter mudado.
          </StateMessage>
        ),
      },
    ],
  },
]);
