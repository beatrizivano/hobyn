import { createBrowserRouter } from 'react-router-dom';
import { ButtonLink, StateMessage } from '../components/common';
import { AppLayout } from '../layouts/AppLayout';
import { FocusLayout } from '../layouts/FocusLayout';
import { ActivateAccountPage, ActivationSentPage, ChangePasswordPage, ForgotPasswordPage, LoginPage, RegisterPage, ResetPasswordPage } from '../modules/auth';
import { BadgesPage } from '../modules/gamificacao';
import { CreateGroupPage, GroupPage, JoinGroupPage } from '../modules/grupos';
import { HomePage } from '../modules/home';
import { EditProfilePage, ProfilePage, SettingsPage } from '../modules/perfil';
import { EditRecordPage, NewRecordPage, RecordPage } from '../modules/registros';
import { GuestRoute, ProtectedRoute } from './SessionRoutes';

export const router = createBrowserRouter([
  { element: <GuestRoute />, children: [{ element: <FocusLayout />, children: [
    { path: '/login', element: <LoginPage /> },
    { path: '/cadastro', element: <RegisterPage /> },
  ] }] },
  { element: <FocusLayout />, children: [
    { path: '/esqueci-a-senha', element: <ForgotPasswordPage /> },
    { path: '/redefinir-senha', element: <ResetPasswordPage /> },
    { path: '/ativar-conta', element: <ActivateAccountPage /> },
    { path: '/ativacao-enviada', element: <ActivationSentPage /> },
  ] },
  { element: <ProtectedRoute />, children: [
    { element: <AppLayout />, children: [
      { path: '/', element: <HomePage /> },
      { path: '/grupos/:groupId', element: <GroupPage /> },
      { path: '/perfil', element: <ProfilePage /> },
      { path: '/conquistas', element: <BadgesPage /> },
      { path: '/configuracoes', element: <SettingsPage /> },
    ] },
    { element: <FocusLayout />, children: [
      { path: '/grupos/novo', element: <CreateGroupPage /> },
      { path: '/grupos/entrar', element: <JoinGroupPage /> },
      { path: '/registros/novo', element: <NewRecordPage /> },
      { path: '/registros/:recordId/editar', element: <EditRecordPage /> },
      { path: '/registros/:recordId', element: <RecordPage /> },
      { path: '/perfil/editar', element: <EditProfilePage /> },
      { path: '/alterar-senha', element: <ChangePasswordPage /> },
    ] },
  ] },
  { element: <FocusLayout />, children: [{ path: '*', element: <StateMessage kind="error" title="Página não encontrada" action={<ButtonLink to="/">Voltar ao início</ButtonLink>}>O endereço pode ter mudado.</StateMessage> }] },
]);
