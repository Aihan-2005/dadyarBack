"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const lawyer_controller_1 = require("../controller/lawyer.controller");
const auth_middlewere_1 = __importDefault(require("../middlewere/auth.middlewere"));
const lawyer_service_1 = require("../services/lawyer.service");
class LawyerRoute {
    constructor() {
        this.path = "/lawyers";
        this.router = (0, express_1.Router)();
        const lawyerService = new lawyer_service_1.LawyerService();
        this.lawyerController =
            new lawyer_controller_1.LawyerController(lawyerService);
        this.initializeMiddlewares();
        this.initializeRoutes();
    }
    initializeMiddlewares() {
        this.router.use(auth_middlewere_1.default);
    }
    initializeRoutes() {
        this.router.get("/me", this.lawyerController.me);
        /**
         * مسیر اصلی مورد استفاده فرانت.
         */
        this.router.put("/me/profile", this.lawyerController
            .updateProfile);
        /**
         * سازگاری موقت با route قبلی.
         */
        this.router.patch("/me", this.lawyerController
            .updateProfile);
    }
}
exports.default = LawyerRoute;
