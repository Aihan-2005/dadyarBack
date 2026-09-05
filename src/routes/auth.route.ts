import { Router } from "express";

import { RedisDatabase } from "../config/redis";

import { RedisOtpStore } from "../stores/otp/redisOtp.store";

import { RedisOtpCooldownStore } from "../stores/otp/redisOtpCooldown.store";

import { OtpService } from "../services/otp.service";

import { AuthController } from "../controllers/auth.controller";

import type { Route } from "../interfaces/route.interface";

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

import { SmsService } from "../services/sms.service";

import { EmailService } from "../services/email.service";

import { OtpDeliveryService } from "../services/otpDelivery.service";
import { UserRepository } from "../repositories/user.repository";
import { LawyerClientRepository } from "../repositories/lawyerClient.repository";

class AuthRoute implements Route {
  public readonly path = "/auth";

  public readonly router = Router();

  private readonly authController: AuthController;

  constructor() {
    const redisDatabase = new RedisDatabase();

    const otpStore = new RedisOtpStore(redisDatabase);

    const otpCooldownStore = new RedisOtpCooldownStore(redisDatabase);

    const smsService = new SmsService();

    const emailService = new EmailService();

    const otpDeliveryService = new OtpDeliveryService(smsService, emailService);

    const otpService = new OtpService(
      otpStore,
      otpCooldownStore,
      otpDeliveryService,
    );

    const userRepository = new UserRepository();

    const lawyerRepository = new LawyerRepository();

    const lawyerClientRepository = new LawyerClientRepository();

    const authService = new AuthService(
      userRepository,
      lawyerRepository,
      lawyerClientRepository,
      otpService,
    );

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
      "/client/signup/otp/request",

      otpRequestRateLimiter,

      this.authController.requestClientSignupOtp,
    );

    this.router.post(
      "/client/signup",

      signupRateLimiter,

      this.authController.clientSignup,
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
