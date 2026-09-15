import { Router } from "express";

import { ClientProfileController } from "../controllers/clientProfile.controller";
import type { Route } from "../interfaces/route.interface";
import requireAuth, {
  requireRole,
} from "../middlewares/auth.middleware";
import { ClientProfileService } from "../services/clientProfile.service";

export class ClientProfileRoute implements Route {
  public readonly path = "/clients/me/profile";

  public readonly router = Router();

  private readonly controller = new ClientProfileController(
    new ClientProfileService(),
  );

  constructor() {
    this.router.use(
      requireAuth,
      requireRole("CLIENT"),
    );

    this.router.get(
      "/",
      this.controller.getMyProfile,
    );

    this.router.patch(
      "/",
      this.controller.updateMyProfile,
    );
  }
}
