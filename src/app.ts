import express, { type Application } from "express";

import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import hpp from "hpp";

import { env, type Enviroment } from "./config/env";

import type { Route } from "./interfaces/routes.interface";

import errorHandler from "./middlewares/error";

class App {
  public readonly app: Application;

  public readonly enviroment: Enviroment;

  private readonly port: number;

  private readonly prefixRoutes = "/api/v1";

  constructor(routes: Route[]) {
    this.app = express();

    this.enviroment = env.NODE_ENV;

    this.port = env.PORT;

    this.initializeApplication();
    this.initializeMiddlewares();
    this.initializeRoutes(routes);
    this.initializeErrorHandling();
  }

  private initializeApplication(): void {
    this.app.disable("x-powered-by");

    if (env.TRUST_PROXY) {
      this.app.set("trust proxy", 1);
    }
  }

  private initializeMiddlewares(): void {
    this.app.use(
      cors({
        origin: (origin, callback) => {
          if (!origin) {
            return callback(null, true);
          }

          if (env.ORIGINS.includes(origin)) {
            return callback(null, true);
          }

          return callback(new Error("Origin is not allowed by CORS"));
        },

        credentials: env.CREDENTIAL,

        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],

        allowedHeaders: ["Content-Type", "Authorization", "Accept"],
      }),
    );

    this.app.use(helmet());

    this.app.use(hpp());

    this.app.use(compression());

    this.app.use(
      express.json({
        limit: "1mb",
      }),
    );

    this.app.use(
      express.urlencoded({
        extended: true,

        limit: "1mb",
      }),
    );

    this.app.use(cookieParser());
  }

  private initializeRoutes(routes: Route[]): void {
    for (const route of routes) {
      this.app.use(
        this.prefixRoutes + route.path,

        route.router,
      );
    }
  }

  private initializeErrorHandling(): void {
    this.app.use(errorHandler);
  }

  public listen(): void {
    this.app.listen(this.port, () => {
      console.log(`Server listening on port ${this.port}`);
    });
  }
}

export default App;

