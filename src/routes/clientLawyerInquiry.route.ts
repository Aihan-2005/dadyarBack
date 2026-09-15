import {
  Router,
} from "express";

import {
  ClientLawyerInquiryController,
} from "../controllers/clientLawyerInquiry.controller";

import type {
  Route,
} from "../interfaces/route.interface";

import requireAuth, {
  requireRole,
} from "../middlewares/auth.middleware";

import {
  ClientLawyerInquiryService,
} from "../services/clientLawyerInquiry.service";


export class ClientLawyerInquiryRoute
  implements Route {

  public readonly path =
    "/client/lawyer-inquiries";

  public readonly router =
    Router();

  private readonly controller =
    new ClientLawyerInquiryController(
      new ClientLawyerInquiryService(),
    );


  constructor() {
    this.router.use(
      requireAuth,

      requireRole(
        "CLIENT",
      ),
    );

    this.router.post(
      "/",

      this.controller.create,
    );

    this.router.get(
      "/",

      this.controller.listForClient,
    );

    this.router.get(
      "/:id",

      this.controller.getForClient,
    );

    this.router.post(
      "/:id/cancel",

      this.controller.cancelForClient,
    );
  }
}


export class LawyerClientInquiryRoute
  implements Route {

  public readonly path =
    "/lawyer/client-inquiries";

  public readonly router =
    Router();

  private readonly controller =
    new ClientLawyerInquiryController(
      new ClientLawyerInquiryService(),
    );


  constructor() {
    this.router.use(
      requireAuth,

      requireRole(
        "LAWYER",
      ),
    );

    this.router.get(
      "/",

      this.controller.listForLawyer,
    );

    this.router.get(
      "/:id",

      this.controller.getForLawyer,
    );

    this.router.patch(
      "/:id",

      this.controller.decideForLawyer,
    );
  }
}