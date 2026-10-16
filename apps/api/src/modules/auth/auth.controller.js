import { authService } from "./auth.service.js";
import { authSchemas } from "./auth.schema.js";
import { AuthError } from "./auth.error.js";
import { refreshCookieOptions } from "./refresh-token.service.js";

export const authController = {
  async register(req, res) {
    const input = authSchemas.register.parse(req.body);
    const result = await authService.register(input);

    res.cookie("refreshToken", result.refreshToken, refreshCookieOptions());
    return res.status(201).json({
      user: result.user,
      accessToken: result.accessToken,
    });
  },

  async login(req, res) {
    const input = authSchemas.login.parse(req.body);
    const result = await authService.login(input);

    res.cookie("refreshToken", result.refreshToken, refreshCookieOptions());
    return res.status(200).json({
      user: result.user,
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
      user: result.user,
      accessToken: result.accessToken,
    });
  },

  async logout(req, res) {
    await authService.logout(req.cookies?.refreshToken);
    res.clearCookie("refreshToken", refreshCookieOptions({ clear: true }));
    return res.status(204).end();
  },

  async me(req, res) {
    return res.status(200).json(req.authUser);
  },
};
