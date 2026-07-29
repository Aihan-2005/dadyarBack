"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controller/auth.controller");
const auth_middlewere_1 = require("../middlewere/auth.middlewere");
const authRateLimit_middlewere_1 = require("../middlewere/authRateLimit.middlewere");
const lawyer_repository_1 = require("../repositories/lawyer.repository");
const auth_service_1 = require("../services/auth.service");
class AuthRoute {
    constructor() {
        this.path = "/auth";
        this.router = (0, express_1.Router)();
        const lawyerRepository = new lawyer_repository_1.LawyerRepository();
        const authService = new auth_service_1.AuthService(lawyerRepository);
        this.authController =
            new auth_controller_1.AuthController(authService);
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.post("/signup", authRateLimit_middlewere_1.signupRateLimiter, this.authController.signup);
        this.router.post("/login", authRateLimit_middlewere_1.loginRateLimiter, this.authController.login);
        this.router.post("/refresh", authRateLimit_middlewere_1.refreshRateLimiter, this.authController.refresh);
        this.router.post("/logout", this.authController.logout);
        this.router.get("/me", auth_middlewere_1.requireAuth, this.authController.me);
    }
}
exports.default = AuthRoute;
