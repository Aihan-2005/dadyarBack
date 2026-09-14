import {
  Router,
} from "express";

import {
  ClientPetitionController,
} from "../controllers/clientPetition.controller";

import type {
  Route,
} from "../interfaces/route.interface";

import requireAuth, {
  requireRole,
} from "../middlewares/auth.middleware";

import {
  ClientPetitionService,
} from "../services/clientPetition.service";


class ClientPetitionRoute
  implements Route {

  public readonly path =
    "/client/petitions";

  public readonly router =
    Router();

  private readonly controller =
    new ClientPetitionController(
      new ClientPetitionService(),
    );


  constructor() {
    this.initializeMiddlewares();

    this.initializeRoutes();
  }


  private initializeMiddlewares(): void {
    this.router.use(
      requireAuth,

      requireRole(
        "CLIENT",
      ),
    );
  }


  private initializeRoutes(): void {
    this.router.post(
      "/",

      this.controller.create,
    );

    this.router.get(
      "/",

      this.controller.list,
    );

    this.router.get(
      "/:id",

      this.controller.getById,
    );

    this.router.patch(
      "/:id",

      this.controller.update,
    );

    this.router.post(
      "/:id/submit",

      this.controller.submit,
    );

    this.router.post(
      "/:id/archive",

      this.controller.archive,
    );

    this.router.delete(
      "/:id",

      this.controller.deleteDraft,
    );
  }
}


export default ClientPetitionRoute;

