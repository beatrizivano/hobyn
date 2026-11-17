import { authService } from "./auth.service.js";
import { authSchemas } from "./auth.schema.js";
import { AuthError } from "./auth.error.js";
import { refreshCookieOptions } from "./refresh-token.service.js";
import { userPhotoView } from "../../shared/photo-view.js";
import { accountSecurityService } from "./account-security.service.js";

export const authController = {
  async register(req, res) {
    const input = authSchemas.register.parse(req.body);
    const result = await authService.register(input);

    if (result.activationRequired) {
      return res.status(201).json({ activationRequired: true, email: result.email });
    }

    res.cookie("refreshToken", result.refreshToken, refreshCookieOptions());
    return res.status(201).json({
      user: userPhotoView(result.user),
      accessToken: result.accessToken,
      activationRequired: false,
    });
  },

  async login(req, res) {
    const input = authSchemas.login.parse(req.body);
    const result = await authService.login(input);

    res.cookie("refreshToken", result.refreshToken, refreshCookieOptions());
    return res.status(200).json({
      user: userPhotoView(result.user),
      accessToken: result.accessToken,
    });
  },

  async refresh(req, res) {
    const refreshToken = req.cookies?.refreshToken;
    let result;

    try {
      result = await authService.refresh(refreshToken);
    } catch (error) {
      if (error instanceof AuthError) {
        res.clearCookie("refreshToken", refreshCookieOptions({ clear: true }));
      }
      throw error;
    }

    res.cookie("refreshToken", result.refreshToken, refreshCookieOptions());
    return res.status(200).json({
      user: userPhotoView(result.user),
      accessToken: result.accessToken,
    });
  },

  async logout(req, res) {
    await authService.logout(req.cookies?.refreshToken);
    res.clearCookie("refreshToken", refreshCookieOptions({ clear: true }));
    return res.status(204).end();
  },

  async me(req, res) {
    return res.status(200).json(userPhotoView(req.authUser));
  },
  async requestPasswordReset(req, res) {
    const { email } = authSchemas.requestPasswordReset.parse(req.body);
    await accountSecurityService.requestReset(email);
    return res.status(202).json({ message: "Se o e-mail estiver cadastrado, enviaremos as instruções." });
  },
  async resetPassword(req, res) {
    const { token, password } = authSchemas.resetPassword.parse(req.body);
    await accountSecurityService.resetPassword(token, password);
    return res.status(204).end();
  },
  async activate(req, res) {
    const { token } = authSchemas.activateAccount.parse(req.body);
    await accountSecurityService.activate(token);
    return res.status(204).end();
  },
  async resendActivation(req, res) {
    const { email } = authSchemas.resendActivation.parse(req.body);
    await accountSecurityService.requestActivation(email);
    return res.status(202).json({ message: "Se a conta estiver pendente, enviaremos um novo link." });
  },
  async requestPasswordChange(req, res) {
    await accountSecurityService.requestChange(req.authUser.id);
    return res.status(202).json({ message: "Enviamos um link de confirmação para seu e-mail." });
  },
  async confirmPasswordChange(req, res) {
    const input = authSchemas.confirmPasswordChange.parse(req.body);
    await accountSecurityService.confirmChange(req.authUser.id, input.token, input.currentPassword, input.password);
    res.clearCookie("refreshToken", refreshCookieOptions({ clear: true }));
    return res.status(204).end();
  },
};
