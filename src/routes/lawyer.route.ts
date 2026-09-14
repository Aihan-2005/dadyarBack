import {
  Router,
} from "express";

import {
  LawyerController,
} from "../controllers/lawyer.controller";

import type {
  Route,
} from "../interfaces/route.interface";

import requireAuth, {
  requireRole,
} from "../middlewares/auth.middleware";

import {
  LawyerService,
} from "../services/lawyer.service";

class LawyerRoute implements Route {
  public readonly path =
    "/lawyers";

  public readonly router =
    Router();

  private readonly lawyerController:
    LawyerController;

  constructor() {
    const lawyerService =
      new LawyerService();

    this.lawyerController =
      new LawyerController(
        lawyerService,
      );

    this.initializeRoutes();
  }

  private initializeRoutes(): void {

    
    

    this.router.get(
      "/directory",

      requireAuth,

      requireRole(
        "CLIENT",
      ),

      this.lawyerController
        .listClientDirectory,
    );

    this.router.get(
      "/directory/:id",

      requireAuth,

      requireRole(
        "CLIENT",
      ),

      this.lawyerController
        .getClientDirectoryLawyer,
    );


    
    this.router.use(
      requireAuth,

      requireRole(
        "LAWYER",
      ),
    );

    this.router.get(
      "/me",

      this.lawyerController
        .me,
    );

    this.router
      .route(
        "/me/profile",
      )
      .get(
        this.lawyerController
          .getProfile,
      )
      .put(
        this.lawyerController
          .updateProfile,
      )
      .patch(
        this.lawyerController
          .updateProfile,
      );

    this.router.patch(
      "/me",

      this.lawyerController
        .updateProfile,
    );
  }
}

export default LawyerRoute;