import { NextFunction, Request, Response } from "express";

import { CaseService } from "../services/case.service";
import { HttpException } from "../exceptions/httpException";
import { MESSAGES } from "../constants/messages";
import { env } from "../config/env";

import {
  CreateCaseSchema,
  UpdateCaseSchema,
  UpdateCaseStateSchema,
  UpdateCourtSchema,
  AddClientSchema,
  UpdateClientSchema,
  AddOpposingPartySchema,
  UpdateOpposingPartySchema,
  AddAssistantLawyerSchema,
  UpdateAssistantLawyerSchema,
  AddOpposingLawyerSchema,
  UpdateOpposingLawyerSchema,
  AddRelatedPersonSchema,
  UpdateRelatedPersonSchema,
  ParamCaseIdSchema,
  ParamCaseAndClientIdSchema,
  ParamCaseAndOpposingPartyIdSchema,
  ParamCaseAndAssistantLawyerIdSchema,
  ParamCaseAndOpposingLawyerIdSchema,
  ParamCaseAndRelatedPersonIdSchema,
  ListCasesQuerySchema,
} from "../validators/case.validator";

const LANGUAGE = env.LANGUAGE;

class CaseController {
  constructor(private readonly caseService: CaseService) {}

  // ---------------- Helpers ----------------

  private getLawyerId(req: Request) {
    const lawyerId = req.user?.id;

    if (!lawyerId) {
      throw new HttpException(401, MESSAGES.unauthorized[LANGUAGE]);
    }

    return lawyerId;
  }

  // ---------------- Cases ----------------

  // POST /cases
  public createCase = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const lawyerId = this.getLawyerId(req);

      const data = CreateCaseSchema.parse(req.body || {});

      const createdCase = await this.caseService.createCase(lawyerId, data);

      return res.status(201).json({
        success: true,
        data: createdCase,
      });
    } catch (err) {
      next(err);
    }
  };

  // GET /cases
  public listCases = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const lawyerId = this.getLawyerId(req);

      const options = ListCasesQuerySchema.parse(req.query);

      const result = await this.caseService.listCases(lawyerId, options);

      return res.status(200).json({
        success: true,
        data: result.items,
        pagination: result.pagination,
      });
    } catch (err) {
      next(err);
    }
  };

  // GET /cases/:caseId
  public getCaseById = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const lawyerId = this.getLawyerId(req);

      const { caseId } = ParamCaseIdSchema.parse(req.params);

      const foundCase = await this.caseService.getCaseById(lawyerId, caseId);

      return res.status(200).json({
        success: true,
        data: foundCase,
      });
    } catch (err) {
      next(err);
    }
  };

  // PATCH /cases/:caseId
  public updateCase = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const lawyerId = this.getLawyerId(req);

      const { caseId } = ParamCaseIdSchema.parse(req.params);

      const data = UpdateCaseSchema.parse(req.body || {});

      const updatedCase = await this.caseService.updateCase(
        lawyerId,
        caseId,
        data,
      );

      return res.status(200).json({
        success: true,
        data: updatedCase,
      });
    } catch (err) {
      next(err);
    }
  };

  // PATCH /cases/:caseId/state
  public updateCaseState = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const lawyerId = this.getLawyerId(req);

      const { caseId } = ParamCaseIdSchema.parse(req.params);

      const { state } = UpdateCaseStateSchema.parse(req.body || {});

      const updatedCase = await this.caseService.updateCaseState(
        lawyerId,
        caseId,
        state,
      );

      return res.status(200).json({
        success: true,
        data: updatedCase,
      });
    } catch (err) {
      next(err);
    }
  };

  // ---------------- Court ----------------

  // PATCH /cases/:caseId/court
  public updateCourt = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const lawyerId = this.getLawyerId(req);

      const { caseId } = ParamCaseIdSchema.parse(req.params);

      const court = UpdateCourtSchema.parse(req.body || {});

      const updatedCase = await this.caseService.updateCourt(
        lawyerId,
        caseId,
        court,
      );

      return res.status(200).json({
        success: true,
        data: updatedCase,
      });
    } catch (err) {
      next(err);
    }
  };

  // ---------------- Clients ----------------

  // POST /cases/:caseId/clients
  public addClient = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const lawyerId = this.getLawyerId(req);

      const { caseId } = ParamCaseIdSchema.parse(req.params);

      const client = AddClientSchema.parse(req.body || {});

      const updatedCase = await this.caseService.addClient(
        lawyerId,
        caseId,
        client,
      );

      return res.status(201).json({
        success: true,
        data: updatedCase,
      });
    } catch (err) {
      next(err);
    }
  };

  // PATCH /cases/:caseId/clients/:clientId
  public updateClient = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const lawyerId = this.getLawyerId(req);

      const { caseId, clientId } = ParamCaseAndClientIdSchema.parse(req.params);

      const client = UpdateClientSchema.parse(req.body || {});

      const updatedCase = await this.caseService.updateClient(
        lawyerId,
        caseId,
        clientId,
        client,
      );

      return res.status(200).json({
        success: true,
        data: updatedCase,
      });
    } catch (err) {
      next(err);
    }
  };

  // DELETE /cases/:caseId/clients/:clientId
  public removeClient = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const lawyerId = this.getLawyerId(req);

      const { caseId, clientId } = ParamCaseAndClientIdSchema.parse(req.params);

      const updatedCase = await this.caseService.removeClient(
        lawyerId,
        caseId,
        clientId,
      );

      return res.status(200).json({
        success: true,
        data: updatedCase,
      });
    } catch (err) {
      next(err);
    }
  };

  // ---------------- Opposing Parties ----------------

  // POST /cases/:caseId/opposing-parties
  public addOpposingParty = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const lawyerId = this.getLawyerId(req);

      const { caseId } = ParamCaseIdSchema.parse(req.params);

      const opposingParty = AddOpposingPartySchema.parse(req.body || {});

      const updatedCase = await this.caseService.addOpposingParty(
        lawyerId,
        caseId,
        opposingParty,
      );

      return res.status(201).json({
        success: true,
        data: updatedCase,
      });
    } catch (err) {
      next(err);
    }
  };

  // PATCH /cases/:caseId/opposing-parties/:opposingPartyId
  public updateOpposingParty = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const lawyerId = this.getLawyerId(req);

      const { caseId, opposingPartyId } =
        ParamCaseAndOpposingPartyIdSchema.parse(req.params);

      const opposingParty = UpdateOpposingPartySchema.parse(req.body || {});

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
    } catch (err) {
      next(err);
    }
  };

  // DELETE /cases/:caseId/opposing-parties/:opposingPartyId
  public removeOpposingParty = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
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
    } catch (err) {
      next(err);
    }
  };

  // ---------------- Assistant Lawyers ----------------

  // POST /cases/:caseId/assistant-lawyers
  public addAssistantLawyer = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const lawyerId = this.getLawyerId(req);

      const { caseId } = ParamCaseIdSchema.parse(req.params);

      const assistantLawyer = AddAssistantLawyerSchema.parse(req.body || {});

      const updatedCase = await this.caseService.addAssistantLawyer(
        lawyerId,
        caseId,
        assistantLawyer,
      );

      return res.status(201).json({
        success: true,
        data: updatedCase,
      });
    } catch (err) {
      next(err);
    }
  };

  // PATCH /cases/:caseId/assistant-lawyers/:assistantLawyerId
  public updateAssistantLawyer = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const lawyerId = this.getLawyerId(req);

      const { caseId, assistantLawyerId } =
        ParamCaseAndAssistantLawyerIdSchema.parse(req.params);

      const assistantLawyer = UpdateAssistantLawyerSchema.parse(req.body || {});

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
    } catch (err) {
      next(err);
    }
  };

  // DELETE /cases/:caseId/assistant-lawyers/:assistantLawyerId
  public removeAssistantLawyer = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
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
    } catch (err) {
      next(err);
    }
  };

  // ---------------- Opposing Lawyers ----------------

  // POST /cases/:caseId/opposing-lawyers
  public addOpposingLawyer = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const lawyerId = this.getLawyerId(req);

      const { caseId } = ParamCaseIdSchema.parse(req.params);

      const opposingLawyer = AddOpposingLawyerSchema.parse(req.body || {});

      const updatedCase = await this.caseService.addOpposingLawyer(
        lawyerId,
        caseId,
        opposingLawyer,
      );

      return res.status(201).json({
        success: true,
        data: updatedCase,
      });
    } catch (err) {
      next(err);
    }
  };

  // PATCH /cases/:caseId/opposing-lawyers/:opposingLawyerId
  public updateOpposingLawyer = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const lawyerId = this.getLawyerId(req);

      const { caseId, opposingLawyerId } =
        ParamCaseAndOpposingLawyerIdSchema.parse(req.params);

      const opposingLawyer = UpdateOpposingLawyerSchema.parse(req.body || {});

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
    } catch (err) {
      next(err);
    }
  };

  // DELETE /cases/:caseId/opposing-lawyers/:opposingLawyerId
  public removeOpposingLawyer = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
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
    } catch (err) {
      next(err);
    }
  };

  // ---------------- Related People ----------------

  // POST /cases/:caseId/related-people
  public addRelatedPerson = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const lawyerId = this.getLawyerId(req);

      const { caseId } = ParamCaseIdSchema.parse(req.params);

      const relatedPerson = AddRelatedPersonSchema.parse(req.body || {});

      const updatedCase = await this.caseService.addRelatedPerson(
        lawyerId,
        caseId,
        relatedPerson,
      );

      return res.status(201).json({
        success: true,
        data: updatedCase,
      });
    } catch (err) {
      next(err);
    }
  };

  // PATCH /cases/:caseId/related-people/:relatedPersonId
  public updateRelatedPerson = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const lawyerId = this.getLawyerId(req);

      const { caseId, relatedPersonId } =
        ParamCaseAndRelatedPersonIdSchema.parse(req.params);

      const relatedPerson = UpdateRelatedPersonSchema.parse(req.body || {});

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
    } catch (err) {
      next(err);
    }
  };

  // DELETE /cases/:caseId/related-people/:relatedPersonId
  public removeRelatedPerson = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
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
    } catch (err) {
      next(err);
    }
  };
}

export default CaseController;
