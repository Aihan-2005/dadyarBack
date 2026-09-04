import type { Request, Response, NextFunction } from "express";
import { AdminService } from "../services/admin.service";
import {
  AdminUserIdParamSchema,
  AdminUserListQuerySchema,
} from "../validators/admin.validator";

export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  public listLawyers = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> => {
    try {
      const query = AdminUserListQuerySchema.parse(req.query);

      const result = await this.adminService.listUsersByRole("LAWYER", query);

      return res.status(200).json({
        success: true,
        data: result.items,
        pagination: result.pagination,
      });
    } catch (error) {
      return next(error);
    }
  };

  public getLawyer = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> => {
    try {
      const { id } = AdminUserIdParamSchema.parse(req.params);

      const user = await this.adminService.getUserByRole(id, "LAWYER");

      return res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      return next(error);
    }
  };

  public listClients = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> => {
    try {
      const query = AdminUserListQuerySchema.parse(req.query);

      const result = await this.adminService.listUsersByRole("CLIENT", query);

      return res.status(200).json({
        success: true,
        data: result.items,
        pagination: result.pagination,
      });
    } catch (error) {
      return next(error);
    }
  };

  public getClient = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> => {
    try {
      const { id } = AdminUserIdParamSchema.parse(req.params);

      const user = await this.adminService.getUserByRole(id, "CLIENT");

      return res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      return next(error);
    }
  };
}
