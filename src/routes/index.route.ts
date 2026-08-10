import { Router } from "express";
import { Route } from "../interfaces/routes.interface";
import IndexController from "../controllers/index.controller";
class IndexRoute implements Route {
  public path = "";
  public router = Router();
  private readonly indexController = new IndexController();

  constructor() {
    this.initilizeRoutes();
  }

  private initilizeRoutes() {
    this.router.get("/", this.indexController.index);
  }
}

export default IndexRoute;
