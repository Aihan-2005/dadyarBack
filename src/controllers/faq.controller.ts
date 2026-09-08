import type { Request, Response, NextFunction } from "express";
import { FAQService } from "../services/faq.service";
import {
  CreateFAQSchema,
  ListFAQSchema,
  ParamFAQIdSchema,
} from "../validators/faq.validator";

export class FAQController {
  constructor(private readonly service: FAQService = new FAQService()) {}

  public createFAQ = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const data = CreateFAQSchema.parse(req.body ?? {});

      const question = await this.service.createFAQ(data);

      res.status(201).json({
        success: true,
        data: question,
      });
    } catch (error) {
      next(error);
    }
  };

  public listFAQ = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> => {
    try {
      const searchOptions = ListFAQSchema.parse(req.query);

      const result = await this.service.listFAQ(searchOptions);

      return res.status(200).json({
        success: true,
        data: result.items,
        pagination: result.pagination,
      });
    } catch (error) {
      return next(error);
    }
  };

  public deleteFAQ = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { id } = ParamFAQIdSchema.parse(req.params ?? {});

      const question = await this.service.deleteFAQ(id);

      res.status(200).json({
        success: true,
        data: question,
      });
    } catch (error) {
      next(error);
    }
  };
}
