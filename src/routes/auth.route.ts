import { Router } from "express";
import { Route } from "../interfaces/routes.interface";
import AuthController from "../controller/auth.controller";
import { AuthService } from "../services/auth.service";
import { LawyerRepository } from "../repositories/lawyer.repository";

class AuthRoute implements Route {
  public path = "/auth";
  public router = Router();

  private readonly authController: AuthController;

  constructor() {
    const lawyerRepo = new LawyerRepository();
    const authService = new AuthService(lawyerRepo);
    this.authController = new AuthController(authService);

    this.initilizeRoutes();
  }

  private initilizeRoutes() {
    this.router.post("/signup", this.authController.signup);
    this.router.post("/login", this.authController.login);
    this.router.post("/refresh", this.authController.refresh);
    this.router.post("/logout", this.authController.logout);
  }
}

export default AuthRoute;
