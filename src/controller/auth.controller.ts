import { NextFunction, Request, Response } from "express";
import { env } from "../config/env";
import { AuthService } from "../services/auth.service";
import { LoginSchema, SignupSchema } from "../validators/auth.validator";
import { HttpExceptoin } from "../exceptions/httpException";
import { MESSAGES } from "../constants/messages";

const LANGUAGE = env.LANGUAGE;
const IS_PROD = env.NODE_ENV === "production";

class AuthController {
  private readonly REFRESH_PATH = "/api/v1/auth/refresh";
  private readonly REFRESH_MAX_AGE = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds

  constructor(private readonly authService: AuthService) {}

  private setRefreshCookie(res: Response, refreshToken: string) {
    res.cookie("refreshToken", refreshToken, {
      maxAge: this.REFRESH_MAX_AGE,
      httpOnly: true,
      secure: IS_PROD,
      sameSite: IS_PROD ? "none" : "lax",
      path: this.REFRESH_PATH,
    });
  }

  private clearRefreshCookie(res: Response) {
    res.clearCookie("refreshToken", {
      secure: IS_PROD,
      sameSite: IS_PROD ? "none" : "lax",
      path: this.REFRESH_PATH,
    });
  }

  public signup = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = SignupSchema.parse(req.body || {});
      const { user, accessToken, refreshToken } =
        await this.authService.signup(parsed);

      this.setRefreshCookie(res, refreshToken);
      res.status(201).json({ success: true, data: { user, accessToken } });
    } catch (err) {
      next(err);
    }
  };

  public login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = LoginSchema.parse(req.body || {});
      const { user, accessToken, refreshToken } =
        await this.authService.login(parsed);

      this.setRefreshCookie(res, refreshToken);

      res.status(200).json({ success: true, data: { user, accessToken } });
    } catch (err) {
      next(err);
    }
  };

  public refresh = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const refreshToken = req.cookies.refreshToken;

      if (!refreshToken)
        throw new HttpExceptoin(401, MESSAGES.unauthorized[LANGUAGE]);

      const { accessToken, refreshToken: newRefreshToken } =
        await this.authService.refresh(refreshToken);

      this.setRefreshCookie(res, newRefreshToken);

      res.status(200).json({ success: true, data: { accessToken } });
    } catch (err) {
      next(err);
    }
  };

  public logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const refreshToken = req.cookies.refreshToken;

      if (refreshToken) await this.authService.logout(refreshToken);

      this.clearRefreshCookie(res);

      return res.status(200).json({ success: true });
    } catch (err) {
      next(err);
    }
  };
}

export default AuthController;
