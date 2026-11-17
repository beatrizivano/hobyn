import bcrypt from "bcryptjs";
import { env } from "../../infra/env.js";
import { mailService } from "../../services/mail.service.js";
import { HttpError } from "../../shared/http-error.js";
import { accountSecurityRepository } from "./account-security.repository.js";
import { emailTokenService } from "./email-token.service.js";

const ttl = { ativacao_conta: 24 * 60, recuperacao_senha: 60, alteracao_senha: 15 };
const pathByType = { ativacao_conta: "/ativar-conta", recuperacao_senha: "/redefinir-senha", alteracao_senha: "/alterar-senha" };
const subjectByType = { ativacao_conta: "Ative sua conta Hobyn", recuperacao_senha: "Redefina sua senha Hobyn", alteracao_senha: "Confirme a alteração da sua senha" };

async function issue(user, tipo) {
  const raw = emailTokenService.generate();
  const now = new Date();
  await accountSecurityRepository.replaceToken(user.id, tipo, emailTokenService.hash(raw), new Date(now.getTime() + ttl[tipo] * 60_000), now);
  const link = `${env.webOrigin}${pathByType[tipo]}?token=${encodeURIComponent(raw)}`;
  await mailService.send({
    to: user.email,
    subject: subjectByType[tipo],
    text: `${user.nome}, use este link para continuar: ${link}\nO link expira em ${ttl[tipo]} minutos.`,
    html: `<p>Olá.</p><p><a href="${link}">Continuar no Hobyn</a></p><p>Este link expira em ${ttl[tipo]} minutos.</p>`,
  });
}

function invalidToken() { return new HttpError("Este link é inválido ou expirou. Solicite um novo.", 400); }

export const accountSecurityService = {
  async requestReset(email) {
    const user = await accountSecurityRepository.findActiveUserByEmail(email);
    if (user) await issue(user, "recuperacao_senha");
  },
  async requestActivation(email) {
    const user = await accountSecurityRepository.findActiveUserByEmail(email);
    if (user && !user.emailVerificadoEm) await issue(user, "ativacao_conta");
  },
  async activate(token) {
    const now = new Date();
    const row = await accountSecurityRepository.findValidToken(emailTokenService.hash(token), "ativacao_conta", now);
    if (!row || !await accountSecurityRepository.activate(row.id, row.userId, now)) throw invalidToken();
  },
  async resetPassword(token, password) {
    const now = new Date();
    const row = await accountSecurityRepository.findValidToken(emailTokenService.hash(token), "recuperacao_senha", now);
    if (!row) throw invalidToken();
    const hash = await bcrypt.hash(password, 12);
    if (!await accountSecurityRepository.changePassword(row.id, row.userId, hash, now)) throw invalidToken();
  },
  async requestChange(userId) {
    const user = await accountSecurityRepository.findUserWithPassword(userId);
    if (!user) throw new HttpError("Usuário não encontrado.", 404);
    await issue(user, "alteracao_senha");
  },
  async confirmChange(userId, token, currentPassword, password) {
    const now = new Date();
    const [row, user] = await Promise.all([
      accountSecurityRepository.findValidToken(emailTokenService.hash(token), "alteracao_senha", now),
      accountSecurityRepository.findUserWithPassword(userId),
    ]);
    if (!row || row.userId !== userId) throw invalidToken();
    if (!user || !await bcrypt.compare(currentPassword, user.hashSenha)) throw new HttpError("A senha atual está incorreta.", 400);
    if (await bcrypt.compare(password, user.hashSenha)) throw new HttpError("A nova senha precisa ser diferente da senha atual.", 400);
    const hash = await bcrypt.hash(password, 12);
    if (!await accountSecurityRepository.changePassword(row.id, userId, hash, now)) throw invalidToken();
  },
  issueActivation: user => issue(user, "ativacao_conta"),
};
