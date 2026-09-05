import type { Request, Response, NextFunction } from "express";
import { AdminService } from "../services/admin.service";
import {
  AdminClientListQuerySchema,
  AdminLawyerListQuerySchema,
  AdminUpdateLawyerStatusSchema,
  AdminUpdateUserStatusSchema,
  AdminUserIdParamSchema,
} from "../validators/admin.validator";

export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  public listLawyers = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> => {
    try {
      const query = AdminLawyerListQuerySchema.parse(req.query);

      const result = await this.adminService.listLawyers(query);

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

      const lawyer = await this.adminService.getLawyerById(id);

      return res.status(200).json({
        success: true,
        data: lawyer,
      });
    } catch (error) {
      return next(error);
    }
  };

  public updateLawyerStatus = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> => {
    try {
      const { id } = AdminUserIdParamSchema.parse(req.params);

      const { status } = AdminUpdateLawyerStatusSchema.parse(req.body ?? {});

      const lawyer = await this.adminService.updateLawyerStatus(id, status);

      return res.status(200).json({
        success: true,
        data: lawyer,
      });
    } catch (error) {
      return next(error);
    }
  };

  public updateLawyerAccountStatus = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> => {
    try {
      const { id } = AdminUserIdParamSchema.parse(req.params);

      const { status } = AdminUpdateUserStatusSchema.parse(req.body ?? {});

      const user = await this.adminService.updateUserAccountStatus(
        id,
        "LAWYER",
        status,
      );

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
      const query = AdminClientListQuerySchema.parse(req.query);

      const result = await this.adminService.listClients(query);

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

      const client = await this.adminService.getClientById(id);

      return res.status(200).json({
        success: true,
        data: client,
      });
    } catch (error) {
      return next(error);
    }
  };

  public updateClientAccountStatus = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> => {
    try {
      const { id } = AdminUserIdParamSchema.parse(req.params);

      const { status } = AdminUpdateUserStatusSchema.parse(req.body ?? {});

      const user = await this.adminService.updateUserAccountStatus(
        id,
        "CLIENT",
        status,
      );

      return res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      return next(error);
    }
  };

  public getDashboard = async (
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> => {
    try {
      const dashboard = await this.adminService.getDashboard();

      return res.status(200).json({
        success: true,
        data: dashboard,
      });
    } catch (error) {
      return next(error);
    }
  };
}
