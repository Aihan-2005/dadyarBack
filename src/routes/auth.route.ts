import { Router } from "express";

import { AuthController } from "../controllers/auth.controller";

import type { Route } from "../interfaces/routes.interface";

import requireAuth from "../middlewares/auth.middleware";

import {
  loginRateLimiter,
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
    const lawyerRepository = new LawyerRepository();

    const authService = new AuthService(lawyerRepository);

    this.authController = new AuthController(authService);

    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post("/signup", signupRateLimiter, this.authController.signup);

    this.router.post("/login", loginRateLimiter, this.authController.login);

    this.router.post(
      "/refresh",
      refreshRateLimiter,
      this.authController.refresh,
    );

    this.router.post("/logout", this.authController.logout);

    this.router.get("/me", requireAuth, this.authController.me);
  }
}

export default AuthRoute;
