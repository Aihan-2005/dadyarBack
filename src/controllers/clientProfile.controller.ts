import type {
  NextFunction,
  Request,
  Response,
} from "express";

import { HttpException } from "../exceptions/httpException";
import { ClientProfileService } from "../services/clientProfile.service";
import { UpdateClientProfileSchema } from "../validators/clientProfile.validator";

export class ClientProfileController {
  constructor(
    private readonly service = new ClientProfileService(),
  ) {}

  private getClientUserId(req: Request): string {
    const userId = req.user?.id;

    if (!userId) {
      throw new HttpException(
        401,
        "ابتدا وارد حساب کاربری شوید",
        "UNAUTHORIZED",
      );
    }

    return userId;
  }

  private disableCaching(res: Response): void {
    res.setHeader(
      "Cache-Control",
      "no-store",
    );

    res.setHeader(
      "Pragma",
      "no-cache",
    );
  }

  public getMyProfile = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> => {
    try {
      const profile = await this.service.getMyProfile(
        this.getClientUserId(req),
      );

      this.disableCaching(res);

      return res.status(200).json({
        success: true,
        data: profile,
      });
    } catch (error) {
      return next(error);
    }
  };

  public updateMyProfile = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> => {
    try {
      const input = UpdateClientProfileSchema.parse(
        req.body ?? {},
      );

      const profile = await this.service.updateMyProfile(
        this.getClientUserId(req),
        input,
      );

      this.disableCaching(res);

      return res.status(200).json({
        success: true,
        data: profile,
      });
    } catch (error) {
      return next(error);
    }
  };
}