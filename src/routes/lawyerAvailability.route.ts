import {
  Router,
} from "express";

import {
  LawyerAvailabilityController,
} from "../controllers/lawyerAvailability.controller";

import type {
  Route,
} from "../interfaces/route.interface";

import requireAuth, {
  requireRole,
} from "../middlewares/auth.middleware";


export class LawyerAvailabilityRoute
  implements Route {

  public readonly path =
    "/lawyer/availability";

  public readonly router =
    Router();

  private readonly controller =
    new LawyerAvailabilityController();


  constructor() {
    this.router.use(
      requireAuth,

      requireRole(
        "LAWYER",
      ),
    );


    this.router.post(
      "/",

      this.controller.create,
    );


    this.router.get(
      "/",

      this.controller.listForLawyer,
    );


    this.router.patch(
      "/:id",

      this.controller.update,
    );


    this.router.delete(
      "/:id",

      this.controller.remove,
    );
  }
}


export class ClientLawyerAvailabilityRoute
  implements Route {

  public readonly path =
    "/client/lawyers";

  public readonly router =
    Router();

  private readonly controller =
    new LawyerAvailabilityController();


  constructor() {
    this.router.use(
      requireAuth,

      requireRole(
        "CLIENT",
      ),
    );


    this.router.get(
      "/:lawyerId/availability",

      this.controller.listForClient,
    );
  }
}