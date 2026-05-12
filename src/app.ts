import express, { Application } from "express";
import { Route } from "./interfaces/routes.interface";
import { env, Enviroment } from "./config/env";
import hpp from "hpp";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";
import errorHandler from "./middlewere/error";

class App {
  public app: Application;
  public enviroment: Enviroment;
  private readonly port: number;
  private readonly origin: string;
  private readonly credentials: boolean;
  private readonly PREFIX_ROUTES = "/api/v1";

  constructor(routes: Route[]) {
    this.app = express();
    this.enviroment = env.NODE_ENV;
    this.port = env.PORT;
    this.origin = env.ORIGIN;
    this.credentials = env.CREDENTIAL;

    this.initilizeMiddileweres();
    this.initilizeRoutes(routes);

    this.initilizeErrorHandeling();
  }

  private initilizeMiddileweres() {
    this.app.use(cors({ origin: this.origin, credentials: this.credentials }));
    this.app.use(hpp());
    this.app.use(helmet());
    this.app.use(compression());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(cookieParser());
  }

  private initilizeRoutes(routes: Route[]) {
    routes.forEach((route) => {
      this.app.use(this.PREFIX_ROUTES + route.path, route.router);
    });
  }

  private initilizeErrorHandeling() {
    this.app.use(errorHandler);
  }

  public listen() {
    this.app.listen(this.port, () => {
      console.log(`server listening on port ${this.port}`);
    });
  }
}

export default App;
