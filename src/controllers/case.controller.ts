import type { NextFunction, Request, Response } from "express";

import { env } from "../config/env";

import { MESSAGES } from "../constants/messages.constants";

import { HttpException } from "../exceptions/httpException";

import { CaseService } from "../services/case.service";

import {
  AddAssistantLawyerSchema,
  AddOpposingLawyerSchema,
  AddOpposingPartySchema,
  AddRelatedPersonSchema,
  CreateCaseSchema,
  ListCasesQuerySchema,
  ParamCaseAndAssistantLawyerIdSchema,
  ParamCaseAndOpposingLawyerIdSchema,
  ParamCaseAndOpposingPartyIdSchema,
  ParamCaseAndRelatedPersonIdSchema,
  ParamCaseIdSchema,
  UpdateAssistantLawyerSchema,
  UpdateCaseSchema,
  UpdateCaseStateSchema,
  UpdateCourtSchema,
  UpdateOpposingLawyerSchema,
  UpdateOpposingPartySchema,
  UpdateRelatedPersonSchema,
} from "../validators/case.validator";

const LANGUAGE = env.LANGUAGE;

class CaseController {
  constructor(private readonly caseService: CaseService) {}

  // ---------------- Helpers ----------------

  private getLawyerId(req: Request): string {
    const lawyerId = req.user?.id;

    if (!lawyerId) {
      throw new HttpException(
        401,
        MESSAGES.unauthorized[LANGUAGE],
        "UNAUTHORIZED",
      );
    }

    return lawyerId;
  }

  // ---------------- Cases ----------------

  // POST /cases
  public createCase = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> => {
    try {
      const lawyerId = this.getLawyerId(req);

      const input = CreateCaseSchema.parse(req.body ?? {});

      const createdCase = await this.caseService.createCase(lawyerId, input);

      return res.status(201).json({
        success: true,

        data: createdCase,
      });
    } catch (error) {
      return next(error);
    }
  };

  // GET /cases
  public listCases = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> => {
    try {
      const lawyerId = this.getLawyerId(req);

      const options = ListCasesQuerySchema.parse(req.query);

      const result = await this.caseService.listCases(lawyerId, options);

      return res.status(200).json({
        success: true,

        data: result.items,

        pagination: result.pagination,
      });
    } catch (error) {
      return next(error);
    }
  };

  // GET /cases/:caseId
  public getCaseById = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> => {
    try {
      const lawyerId = this.getLawyerId(req);

      const { caseId } = ParamCaseIdSchema.parse(req.params);

      const foundCase = await this.caseService.getCaseById(lawyerId, caseId);

      return res.status(200).json({
        success: true,

        data: foundCase,
      });
    } catch (error) {
      return next(error);
    }
  };

  // PATCH /cases/:caseId
  public updateCase = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> => {
    try {
      const lawyerId = this.getLawyerId(req);

      const { caseId } = ParamCaseIdSchema.parse(req.params);

      const input = UpdateCaseSchema.parse(req.body ?? {});

      const updatedCase = await this.caseService.updateCase(
        lawyerId,
        caseId,
        input,
      );

      return res.status(200).json({
        success: true,

        data: updatedCase,
      });
    } catch (error) {
      return next(error);
    }
  };

  // PATCH /cases/:caseId/state
  public updateCaseState = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> => {
    try {
      const lawyerId = this.getLawyerId(req);

      const { caseId } = ParamCaseIdSchema.parse(req.params);

      const { state } = UpdateCaseStateSchema.parse(req.body ?? {});

      const updatedCase = await this.caseService.updateCaseState(
        lawyerId,
        caseId,
        state,
      );

      return res.status(200).json({
        success: true,

        data: updatedCase,
      });
    } catch (error) {
      return next(error);
    }
  };

  // ---------------- Court ----------------

  // PATCH /cases/:caseId/court
  public updateCourt = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> => {
    try {
      const lawyerId = this.getLawyerId(req);

      const { caseId } = ParamCaseIdSchema.parse(req.params);

      const court = UpdateCourtSchema.parse(req.body ?? {});

      const updatedCase = await this.caseService.updateCourt(
        lawyerId,
        caseId,
        court,
      );

      return res.status(200).json({
        success: true,

        data: updatedCase,
      });
    } catch (error) {
      return next(error);
    }
  };

  // ---------------- Opposing Parties ----------------

  // POST /cases/:caseId/opposing-parties
  public addOpposingParty = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> => {
    try {
      const lawyerId = this.getLawyerId(req);

      const { caseId } = ParamCaseIdSchema.parse(req.params);

      const opposingParty = AddOpposingPartySchema.parse(req.body ?? {});

      const updatedCase = await this.caseService.addOpposingParty(
        lawyerId,
        caseId,
        opposingParty,
      );

      return res.status(201).json({
        success: true,

        data: updatedCase,
      });
    } catch (error) {
      return next(error);
    }
  };

  // PATCH /cases/:caseId/opposing-parties/:opposingPartyId
  public updateOpposingParty = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> => {
    try {
      const lawyerId = this.getLawyerId(req);

      const { caseId, opposingPartyId } =
        ParamCaseAndOpposingPartyIdSchema.parse(req.params);

      const opposingParty = UpdateOpposingPartySchema.parse(req.body ?? {});

      const updatedCase = await this.caseService.updateOpposingParty(
        lawyerId,
        caseId,
        opposingPartyId,
        opposingParty,
      );

      return res.status(200).json({
        success: true,

        data: updatedCase,
      });
    } catch (error) {
      return next(error);
    }
  };

  // DELETE /cases/:caseId/opposing-parties/:opposingPartyId
  public removeOpposingParty = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> => {
    try {
      const lawyerId = this.getLawyerId(req);

      const { caseId, opposingPartyId } =
        ParamCaseAndOpposingPartyIdSchema.parse(req.params);

      const updatedCase = await this.caseService.removeOpposingParty(
        lawyerId,
        caseId,
        opposingPartyId,
      );

      return res.status(200).json({
        success: true,

        data: updatedCase,
      });
    } catch (error) {
      return next(error);
    }
  };

  // ---------------- Assistant Lawyers ----------------

  // POST /cases/:caseId/assistant-lawyers
  public addAssistantLawyer = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> => {
    try {
      const lawyerId = this.getLawyerId(req);

      const { caseId } = ParamCaseIdSchema.parse(req.params);

      const assistantLawyer = AddAssistantLawyerSchema.parse(req.body ?? {});

      const updatedCase = await this.caseService.addAssistantLawyer(
        lawyerId,
        caseId,
        assistantLawyer,
      );

      return res.status(201).json({
        success: true,

        data: updatedCase,
      });
    } catch (error) {
      return next(error);
    }
  };

  // PATCH /cases/:caseId/assistant-lawyers/:assistantLawyerId
  public updateAssistantLawyer = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> => {
    try {
      const lawyerId = this.getLawyerId(req);

      const { caseId, assistantLawyerId } =
        ParamCaseAndAssistantLawyerIdSchema.parse(req.params);

      const assistantLawyer = UpdateAssistantLawyerSchema.parse(req.body ?? {});

      const updatedCase = await this.caseService.updateAssistantLawyer(
        lawyerId,
        caseId,
        assistantLawyerId,
        assistantLawyer,
      );

      return res.status(200).json({
        success: true,

        data: updatedCase,
      });
    } catch (error) {
      return next(error);
    }
  };

  // DELETE /cases/:caseId/assistant-lawyers/:assistantLawyerId
  public removeAssistantLawyer = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> => {
    try {
      const lawyerId = this.getLawyerId(req);

      const { caseId, assistantLawyerId } =
        ParamCaseAndAssistantLawyerIdSchema.parse(req.params);

      const updatedCase = await this.caseService.removeAssistantLawyer(
        lawyerId,
        caseId,
        assistantLawyerId,
      );

      return res.status(200).json({
        success: true,

        data: updatedCase,
      });
    } catch (error) {
      return next(error);
    }
  };

  // ---------------- Opposing Lawyers ----------------

  // POST /cases/:caseId/opposing-lawyers
  public addOpposingLawyer = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> => {
    try {
      const lawyerId = this.getLawyerId(req);

      const { caseId } = ParamCaseIdSchema.parse(req.params);

      const opposingLawyer = AddOpposingLawyerSchema.parse(req.body ?? {});

      const updatedCase = await this.caseService.addOpposingLawyer(
        lawyerId,
        caseId,
        opposingLawyer,
      );

      return res.status(201).json({
        success: true,

        data: updatedCase,
      });
    } catch (error) {
      return next(error);
    }
  };

  // PATCH /cases/:caseId/opposing-lawyers/:opposingLawyerId
  public updateOpposingLawyer = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> => {
    try {
      const lawyerId = this.getLawyerId(req);

      const { caseId, opposingLawyerId } =
        ParamCaseAndOpposingLawyerIdSchema.parse(req.params);

      const opposingLawyer = UpdateOpposingLawyerSchema.parse(req.body ?? {});

      const updatedCase = await this.caseService.updateOpposingLawyer(
        lawyerId,
        caseId,
        opposingLawyerId,
        opposingLawyer,
      );

      return res.status(200).json({
        success: true,

        data: updatedCase,
      });
    } catch (error) {
      return next(error);
    }
  };

  // DELETE /cases/:caseId/opposing-lawyers/:opposingLawyerId
  public removeOpposingLawyer = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> => {
    try {
      const lawyerId = this.getLawyerId(req);

      const { caseId, opposingLawyerId } =
        ParamCaseAndOpposingLawyerIdSchema.parse(req.params);

      const updatedCase = await this.caseService.removeOpposingLawyer(
        lawyerId,
        caseId,
        opposingLawyerId,
      );

      return res.status(200).json({
        success: true,

        data: updatedCase,
      });
    } catch (error) {
      return next(error);
    }
  };

  // ---------------- Related People ----------------

  // POST /cases/:caseId/related-people
  public addRelatedPerson = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> => {
    try {
      const lawyerId = this.getLawyerId(req);

      const { caseId } = ParamCaseIdSchema.parse(req.params);

      const relatedPerson = AddRelatedPersonSchema.parse(req.body ?? {});

      const updatedCase = await this.caseService.addRelatedPerson(
        lawyerId,
        caseId,
        relatedPerson,
      );

      return res.status(201).json({
        success: true,

        data: updatedCase,
      });
    } catch (error) {
      return next(error);
    }
  };

  // PATCH /cases/:caseId/related-people/:relatedPersonId
  public updateRelatedPerson = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> => {
    try {
      const lawyerId = this.getLawyerId(req);

      const { caseId, relatedPersonId } =
        ParamCaseAndRelatedPersonIdSchema.parse(req.params);

      const relatedPerson = UpdateRelatedPersonSchema.parse(req.body ?? {});

      const updatedCase = await this.caseService.updateRelatedPerson(
        lawyerId,
        caseId,
        relatedPersonId,
        relatedPerson,
      );

      return res.status(200).json({
        success: true,

        data: updatedCase,
      });
    } catch (error) {
      return next(error);
    }
  };

  // DELETE /cases/:caseId/related-people/:relatedPersonId
  public removeRelatedPerson = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> => {
    try {
      const lawyerId = this.getLawyerId(req);

      const { caseId, relatedPersonId } =
        ParamCaseAndRelatedPersonIdSchema.parse(req.params);

      const updatedCase = await this.caseService.removeRelatedPerson(
        lawyerId,
        caseId,
        relatedPersonId,
      );

      return res.status(200).json({
        success: true,

        data: updatedCase,
      });
    } catch (error) {
      return next(error);
    }
  };
}

export default CaseController;
