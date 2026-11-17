# Ativação por e-mail e senhas

O módulo cobre confirmação de senha no cadastro, ativação de conta, recuperação
de senha e troca autenticada. Tokens enviados por e-mail são aleatórios, salvos
somente como SHA-256, têm finalidade específica, validade curta e uso único.

## Fluxos

- **Cadastro:** a confirmação existe somente na web e não é enviada à API. Com
  `EMAIL_VERIFICATION_REQUIRED=true`, o cadastro não cria sessão; envia um link
  de ativação válido por 24 horas. Contas anteriores à migration foram marcadas
  como verificadas.
- **Recuperação:** “Esqueci minha senha” sempre responde com mensagem neutra. O
  link vale por 60 minutos. A nova senha revoga todas as sessões.
- **Troca autenticada:** em Configurações, a pessoa solicita um link válido por
  15 minutos. A tela exige o token, a senha atual, a nova senha e a confirmação.
  Ao concluir, todas as sessões — inclusive a atual — são encerradas.
- **Reenvio:** invalida tokens anteriores ainda pendentes da mesma finalidade.

## E-mail local e produção

No modo local (`MAIL_MODE=log`), o link aparece no terminal da API e nenhum e-mail
real é enviado. Para produção, configure SMTP:

```env
MAIL_MODE=smtp
MAIL_FROM=Hobyn <noreply@seudominio.com.br>
EMAIL_VERIFICATION_REQUIRED=true
SMTP_HOST=smtp.seuprovedor.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=...
SMTP_PASSWORD=...
```

Não é necessário manter uma caixa de entrada para `noreply`; o endereço precisa
ser um remetente autorizado pelo provedor. O domínio deve ter SPF e DKIM e,
preferencialmente, DMARC. Só habilite a verificação obrigatória depois de validar
entrega, URL pública em `WEB_ORIGIN` e credenciais SMTP.

## Endpoints

| Método | Rota | Acesso |
| --- | --- | --- |
| `POST` | `/api/auth/activate` | público, token de ativação |
| `POST` | `/api/auth/activate/resend` | público, resposta neutra |
| `POST` | `/api/auth/password/forgot` | público, resposta neutra |
| `POST` | `/api/auth/password/reset` | público, token de recuperação |
| `POST` | `/api/auth/password/change/request` | sessão ativa |
| `POST` | `/api/auth/password/change/confirm` | sessão ativa, token e senha atual |

## Verificação

```powershell
corepack pnpm test
corepack pnpm test:password-email
corepack pnpm typecheck
corepack pnpm lint
corepack pnpm build
```

O teste integrado cobre e-mail inexistente, uso único, expiração lógica, senha
atual incorreta, ativação obrigatória e revogação de múltiplas sessões.
