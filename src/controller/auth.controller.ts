import type { CookieOptions, NextFunction, Request, Response } from "express";

import { env } from "../config/env";

import { MESSAGES } from "../constants/messages";

import { HttpException } from "../exceptions/httpException";

import { AuthService } from "../services/auth.service";

import { LoginSchema, SignupSchema } from "../validators/auth.validator";

const LANGUAGE = env.LANGUAGE;

export class AuthController {
  private readonly refreshCookieName = "dadyar_refresh_token";

  private readonly refreshCookiePath = "/api";

  constructor(private readonly authService: AuthService) {}

  private getRefreshCookieOptions(): CookieOptions {
    return {
      httpOnly: true,

      secure: env.COOKIE_SECURE,

      sameSite: "lax",

      path: this.refreshCookiePath,

      maxAge: env.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000,
    };
  }

  private setRefreshCookie(res: Response, refreshToken: string): void {
    res.cookie(
      this.refreshCookieName,
      refreshToken,
      this.getRefreshCookieOptions(),
    );
  }

  private clearRefreshCookie(res: Response): void {
    const { maxAge: _maxAge, ...clearOptions } = this.getRefreshCookieOptions();

    res.clearCookie(this.refreshCookieName, clearOptions);
  }

  private disableCaching(res: Response): void {
    res.setHeader("Cache-Control", "no-store");

    res.setHeader("Pragma", "no-cache");
  }

  private getRefreshToken(req: Request): string | null {
    const token = req.cookies?.[this.refreshCookieName];

    return typeof token === "string" ? token : null;
  }

  public signup = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> => {
    try {
      const input = await SignupSchema.parseAsync(req.body ?? {});

      const { user, accessToken, refreshToken, accessTokenExpiresIn } =
        await this.authService.signup(input);

      this.disableCaching(res);

      this.setRefreshCookie(res, refreshToken);

      return res.status(201).json({
        success: true,

        data: {
          user,

          accessToken,

          accessTokenExpiresIn,
        },
      });
    } catch (error) {
      return next(error);
    }
  };

  public login = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> => {
    try {
      const input = await LoginSchema.parseAsync(req.body ?? {});

      const { user, accessToken, refreshToken, accessTokenExpiresIn } =
        await this.authService.login(input);

      this.disableCaching(res);

      this.setRefreshCookie(res, refreshToken);

      return res.status(200).json({
        success: true,

        data: {
          user,

          accessToken,

          accessTokenExpiresIn,
        },
      });
    } catch (error) {
      return next(error);
    }
  };

  public refresh = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> => {
    try {
      const refreshToken = this.getRefreshToken(req);

      if (!refreshToken) {
        throw new HttpException(
          401,
          MESSAGES.refTokenMandatory[LANGUAGE],
          "REFRESH_TOKEN_REQUIRED",
        );
      }

      const {
        accessToken,
        refreshToken: newRefreshToken,
        accessTokenExpiresIn,
      } = await this.authService.refresh(refreshToken);

      this.disableCaching(res);

      this.setRefreshCookie(res, newRefreshToken);

      return res.status(200).json({
        success: true,

        data: {
          accessToken,

          accessTokenExpiresIn,
        },
      });
    } catch (error) {
      return next(error);
    }
  };

  public logout = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> => {
    const refreshToken = this.getRefreshToken(req);

    try {
      if (refreshToken) {
        await this.authService.logout(refreshToken);
      }

      this.disableCaching(res);

      this.clearRefreshCookie(res);

      return res.status(200).json({
        success: true,

        data: null,
      });
    } catch (error) {
      this.clearRefreshCookie(res);

      return next(error);
    }
  };

  public me = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> => {
    try {
      const lawyerId = req.user?.id;

      if (!lawyerId) {
        throw new HttpException(
          401,
          MESSAGES.unauthorized[LANGUAGE],
          "UNAUTHORIZED",
        );
      }

      const user = await this.authService.me(lawyerId);

      this.disableCaching(res);

      return res.status(200).json({
        success: true,

        data: {
          user,
        },
      });
    } catch (error) {
      return next(error);
    }
  };
}
