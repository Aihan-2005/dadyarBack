import {
  Router,
} from "express";

import onlineContractController from "../controllers/onlineContract.controller";

import type {
  Route,
} from "../interfaces/route.interface";

import requireAuth, {
  requireRole,
} from "../middlewares/auth.middleware";

export class ClientOnlineContractRoute
  implements Route {
  public readonly path =
    "/client/online-contracts";

  public readonly router =
    Router();

  constructor() {
    this.router.use(
      requireAuth,

      requireRole(
        "CLIENT",
      ),
    );

    this.router.post(
      "/",
      onlineContractController.createForClient,
    );

    this.router.get(
      "/",
      onlineContractController.listForClient,
    );

    this.router.get(
      "/:id",
      onlineContractController.getForClient,
    );

    this.router.patch(
      "/:id/approve",
      onlineContractController.approveForClient,
    );

    this.router.patch(
      "/:id/request-changes",
      onlineContractController.requestChangesForClient,
    );
  }
}

export class LawyerOnlineContractRoute
  implements Route {
  public readonly path =
    "/lawyer/online-contracts";

  public readonly router =
    Router();

  constructor() {
    this.router.use(
      requireAuth,

      requireRole(
        "LAWYER",
      ),
    );

    this.router.get(
      "/",
      onlineContractController.listForLawyer,
    );

    this.router.get(
      "/:id",
      onlineContractController.getForLawyer,
    );

    this.router.patch(
      "/:id/review",
      onlineContractController.reviewForLawyer,
    );

    this.router.patch(
      "/:id/sign",
      onlineContractController.signForLawyer,
    );

    this.router.patch(
      "/:id/reject",
      onlineContractController.rejectForLawyer,
    );
  }
}
