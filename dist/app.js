"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const compression_1 = __importDefault(require("compression"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const hpp_1 = __importDefault(require("hpp"));
const env_1 = require("./config/env");
const error_1 = __importDefault(require("./middlewere/error"));
class App {
    constructor(routes) {
        this.prefixRoutes = "/api/v1";
        this.app =
            (0, express_1.default)();
        this.enviroment =
            env_1.env.NODE_ENV;
        this.port =
            env_1.env.PORT;
        this.initializeApplication();
        this.initializeMiddlewares();
        this.initializeRoutes(routes);
        this.initializeErrorHandling();
    }
    initializeApplication() {
        this.app.disable("x-powered-by");
        if (env_1.env.TRUST_PROXY) {
            this.app.set("trust proxy", 1);
        }
    }
    initializeMiddlewares() {
        this.app.use((0, cors_1.default)({
            origin: (origin, callback) => {
                if (!origin) {
                    return callback(null, true);
                }
                if (env_1.env.ORIGINS.includes(origin)) {
                    return callback(null, true);
                }
                return callback(new Error("Origin is not allowed by CORS"));
            },
            credentials: env_1.env.CREDENTIAL,
            methods: [
                "GET",
                "POST",
                "PUT",
                "PATCH",
                "DELETE",
                "OPTIONS",
            ],
            allowedHeaders: [
                "Content-Type",
                "Authorization",
                "Accept",
            ],
        }));
        this.app.use((0, helmet_1.default)());
        this.app.use((0, hpp_1.default)());
        this.app.use((0, compression_1.default)());
        this.app.use(express_1.default.json({
            limit: "1mb",
        }));
        this.app.use(express_1.default.urlencoded({
            extended: true,
            limit: "1mb",
        }));
        this.app.use((0, cookie_parser_1.default)());
    }
    initializeRoutes(routes) {
        for (const route of routes) {
            this.app.use(this.prefixRoutes +
                route.path, route.router);
        }
    }
    initializeErrorHandling() {
        this.app.use(error_1.default);
    }
    listen() {
        this.app.listen(this.port, () => {
            console.log(`Server listening on port ${this.port}`);
        });
    }
}
exports.default = App;
