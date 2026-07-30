"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const env_1 = require("../config/env");
const messages_1 = require("../constants/messages");
const httpException_1 = require("../exceptions/httpException");
const auth_validator_1 = require("../validators/auth.validator");
const LANGUAGE = env_1.env.LANGUAGE;
class AuthController {
  constructor(authService) {
    this.authService = authService;
    this.refreshCookieName = "dadyar_refresh_token";
    this.refreshCookiePath = "/api";
    this.signup = async (req, res, next) => {
      try {
        const input = await auth_validator_1.SignupSchema.parseAsync(
          req.body ?? {},
        );
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
    this.login = async (req, res, next) => {
      try {
        const input = await auth_validator_1.LoginSchema.parseAsync(
          req.body ?? {},
        );
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
    this.refresh = async (req, res, next) => {
      try {
        const refreshToken = this.getRefreshToken(req);
        if (!refreshToken) {
          throw new httpException_1.HttpException(
            401,
            messages_1.MESSAGES.refTokenMandatory[LANGUAGE],
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
    this.logout = async (req, res, next) => {
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
    this.me = async (req, res, next) => {
      try {
        const lawyerId = req.user?.id;
        if (!lawyerId) {
          throw new httpException_1.HttpException(
            401,
            messages_1.MESSAGES.unauthorized[LANGUAGE],
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
  getRefreshCookieOptions() {
    return {
      httpOnly: true,
      secure: env_1.env.COOKIE_SECURE,
      sameSite: "lax",
      path: this.refreshCookiePath,
      maxAge: env_1.env.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000,
    };
  }
  setRefreshCookie(res, refreshToken) {
    res.cookie(
      this.refreshCookieName,
      refreshToken,
      this.getRefreshCookieOptions(),
    );
  }
  clearRefreshCookie(res) {
    const { maxAge: _maxAge, ...clearOptions } = this.getRefreshCookieOptions();
    res.clearCookie(this.refreshCookieName, clearOptions);
  }
  disableCaching(res) {
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("Pragma", "no-cache");
  }
  getRefreshToken(req) {
    const token = req.cookies?.[this.refreshCookieName];
    return typeof token === "string" ? token : null;
  }
}
exports.AuthController = AuthController;
