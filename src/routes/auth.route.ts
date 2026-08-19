import { Router } from "express";

import { RedisDatabase } from "../config/redis";

import { RedisOtpStore } from "../stores/otp/redisOtp.store";

import { RedisOtpCooldownStore } from "../stores/otp/redisOtpCooldown.store";

import { OtpService } from "../services/otp.service";

import { AuthController } from "../controllers/auth.controller";

import type { Route } from "../interfaces/routes.interface";

import requireAuth from "../middlewares/auth.middleware";

import {
  loginRateLimiter,
  otpLoginRateLimiter,
  otpRequestRateLimiter,
  passwordChangeRateLimiter,
  passwordChangeRequestRateLimiter,
  refreshRateLimiter,
  signupRateLimiter,
} from "../middlewares/authRateLimit.middleware";

import { LawyerRepository } from "../repositories/lawyer.repository";

import { AuthService } from "../services/auth.service";

class AuthRoute implements Route {
  public readonly path = "/auth";

  public readonly router = Router();

  private readonly authController: AuthController;

  constructor() {
    const redisDatabase = new RedisDatabase();

    const otpStore = new RedisOtpStore(redisDatabase);

    const otpCooldownStore = new RedisOtpCooldownStore(redisDatabase);

    const otpService = new OtpService(otpStore, otpCooldownStore);

    const lawyerRepository = new LawyerRepository();

    const authService = new AuthService(lawyerRepository, otpService);

    this.authController = new AuthController(authService);

    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post("/signup", signupRateLimiter, this.authController.signup);

    this.router.post("/login", loginRateLimiter, this.authController.login);

    this.router.post(
      "/otp/request",

      otpRequestRateLimiter,

      this.authController.requestOtpLogin,
    );

    this.router.post(
      "/otp/login",

      otpLoginRateLimiter,

      this.authController.otpLogin,
    );

    this.router.post(
      "/refresh",
      refreshRateLimiter,
      this.authController.refresh,
    );

    this.router.post("/logout", this.authController.logout);

    this.router.get("/me", requireAuth, this.authController.me);

    this.router.post(
      "/password/change/request",
      requireAuth,
      passwordChangeRequestRateLimiter,
      this.authController.requestPasswordChange,
    );

    this.router.patch(
      "/password",
      requireAuth,
      passwordChangeRateLimiter,
      this.authController.changePassword,
    );
  }
}

export default AuthRoute;
