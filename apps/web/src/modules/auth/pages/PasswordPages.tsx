import { useState, type FormEvent } from 'react';
import { authSchemas } from 'shared';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button, ButtonLink, ScreenHeader, TextField } from '../../../components/common';
import { authService } from '../../../services/auth.service';
import { errorMessage } from '../../../services/http';
import { AuthHeader } from '../components/AuthHeader';
import styles from './AuthPage.module.css';

function validPassword(value: string) { const result = authSchemas.password.safeParse(value); return result.success ? undefined : result.error.issues[0]?.message; }

export function ForgotPasswordPage() {
  const [email, setEmail] = useState(''); const [message, setMessage] = useState(''); const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent) { event.preventDefault(); if (busy) return; setBusy(true); setError(''); try { const result = await authService.requestPasswordReset(email); setMessage(result.message); } catch (failure) { setError(errorMessage(failure)); } finally { setBusy(false); } }
  return <div className={styles.page}><AuthHeader /><h1 className={styles.title}>Recuperar senha</h1><p>Informe seu e-mail para receber um link de uso único.</p><form onSubmit={submit}><TextField label="E-mail" type="email" autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} />{error && <p role="alert">{error}</p>}{message && <p role="status">{message}</p>}<Button type="submit" variant="primary" fullWidth disabled={busy}>{busy ? 'Enviando…' : 'Enviar link'}</Button></form><Link to="/login">Voltar ao login</Link></div>;
}

export function ResetPasswordPage() {
  const [params] = useSearchParams(); const token = params.get('token') ?? ''; const [password, setPassword] = useState(''); const [confirmation, setConfirmation] = useState(''); const [error, setError] = useState(''); const [done, setDone] = useState(false); const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent) { event.preventDefault(); if (busy) return; const invalid = validPassword(password); if (invalid) { setError(invalid); return; } if (password !== confirmation) { setError('As senhas precisam ser iguais.'); return; } setBusy(true); setError(''); try { await authService.resetPassword(token, password); setDone(true); } catch (failure) { setError(errorMessage(failure)); } finally { setBusy(false); } }
  if (done) return <div className={styles.page}><AuthHeader /><h1 className={styles.title}>Senha redefinida</h1><ButtonLink to="/login" variant="primary">Entrar</ButtonLink></div>;
  return <div className={styles.page}><AuthHeader /><h1 className={styles.title}>Nova senha</h1><form onSubmit={submit}><TextField label="Nova senha" type="password" autoComplete="new-password" value={password} onChange={event => setPassword(event.target.value)} /><TextField label="Confirmar nova senha" type="password" autoComplete="new-password" value={confirmation} onChange={event => setConfirmation(event.target.value)} />{error && <p role="alert">{error}</p>}<Button type="submit" variant="primary" fullWidth disabled={busy || !token}>{busy ? 'Salvando…' : 'Redefinir senha'}</Button></form></div>;
}

export function ActivateAccountPage() {
  const [params] = useSearchParams(); const token = params.get('token') ?? ''; const [error, setError] = useState(''); const [done, setDone] = useState(false); const [busy, setBusy] = useState(false);
  async function activate() { if (busy) return; setBusy(true); setError(''); try { await authService.activateAccount(token); setDone(true); } catch (failure) { setError(errorMessage(failure)); } finally { setBusy(false); } }
  return <div className={styles.page}><AuthHeader /><h1 className={styles.title}>{done ? 'Conta ativada' : 'Ativar conta'}</h1>{done ? <ButtonLink to="/login" variant="primary">Entrar</ButtonLink> : <><p>Confirme a ativação da sua conta Hobyn.</p>{error && <p role="alert">{error}</p>}<Button variant="primary" fullWidth disabled={busy || !token} onClick={() => void activate()}>{busy ? 'Ativando…' : 'Ativar minha conta'}</Button></>}</div>;
}

export function ActivationSentPage() {
  const [params] = useSearchParams(); const email = params.get('email') ?? ''; const [message, setMessage] = useState(''); const [busy, setBusy] = useState(false);
  async function resend() { if (busy) return; setBusy(true); try { const result = await authService.resendActivation(email); setMessage(result.message); } finally { setBusy(false); } }
  return <div className={styles.page}><AuthHeader /><h1 className={styles.title}>Confira seu e-mail</h1><p>Enviamos um link para ativar sua conta. No ambiente local, o link aparece no terminal da API.</p>{message && <p role="status">{message}</p>}<Button disabled={busy || !email} onClick={() => void resend()}>{busy ? 'Enviando…' : 'Reenviar e-mail'}</Button><Link to="/login">Ir para o login</Link></div>;
}

export function ChangePasswordPage() {
  const [params] = useSearchParams(); const token = params.get('token') ?? ''; const navigate = useNavigate(); const [current, setCurrent] = useState(''); const [password, setPassword] = useState(''); const [confirmation, setConfirmation] = useState(''); const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent) { event.preventDefault(); if (busy) return; const invalid = validPassword(password); if (invalid) { setError(invalid); return; } if (password !== confirmation) { setError('As senhas precisam ser iguais.'); return; } setBusy(true); setError(''); try { await authService.confirmPasswordChange(token, current, password); navigate('/login', { replace: true, state: { passwordChanged: true } }); } catch (failure) { setError(errorMessage(failure)); } finally { setBusy(false); } }
  return <div className={styles.page}><ScreenHeader title="Alterar senha" backTo="/configuracoes" /><p>Depois da alteração, todos os dispositivos precisarão entrar novamente.</p><form onSubmit={submit}><TextField label="Senha atual" type="password" autoComplete="current-password" value={current} onChange={event => setCurrent(event.target.value)} /><TextField label="Nova senha" type="password" autoComplete="new-password" value={password} onChange={event => setPassword(event.target.value)} /><TextField label="Confirmar nova senha" type="password" autoComplete="new-password" value={confirmation} onChange={event => setConfirmation(event.target.value)} />{error && <p role="alert">{error}</p>}<Button type="submit" variant="primary" fullWidth disabled={busy || !token}>{busy ? 'Alterando…' : 'Alterar senha'}</Button></form></div>;
}
