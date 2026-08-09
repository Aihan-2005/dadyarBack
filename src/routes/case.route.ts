import { Router } from "express";
import CaseController from "../controllers/case.controller";
import { CaseService } from "../services/case.service";
import { Route } from "../interfaces/routes.interface";
import requireAuth from "../middlewares/auth.middleware";

class CaseRoute implements Route {
  public path = "/cases";
  public router = Router();

  private readonly caseController = new CaseController(new CaseService());

  constructor() {
    this.authRoutes();
    this.initilizeRoutes();
  }

  private authRoutes() {
    this.router.use(requireAuth);
  }

  private initilizeRoutes() {
    // ---------------- Cases ----------------

    this.router.post("/", this.caseController.createCase);

    this.router.get("/", this.caseController.listCases);

    this.router.get("/:caseId", this.caseController.getCaseById);

    this.router.patch("/:caseId", this.caseController.updateCase);

    this.router.patch("/:caseId/state", this.caseController.updateCaseState);

    // ---------------- Court ----------------

    this.router.patch("/:caseId/court", this.caseController.updateCourt);

    // ---------------- Opposing Parties ----------------

    this.router.post(
      "/:caseId/opposing-parties",
      this.caseController.addOpposingParty,
    );

    this.router.patch(
      "/:caseId/opposing-parties/:opposingPartyId",
      this.caseController.updateOpposingParty,
    );

    this.router.delete(
      "/:caseId/opposing-parties/:opposingPartyId",
      this.caseController.removeOpposingParty,
    );

    // ---------------- Assistant Lawyers ----------------

    this.router.post(
      "/:caseId/assistant-lawyers",
      this.caseController.addAssistantLawyer,
    );

    this.router.patch(
      "/:caseId/assistant-lawyers/:assistantLawyerId",
      this.caseController.updateAssistantLawyer,
    );

    this.router.delete(
      "/:caseId/assistant-lawyers/:assistantLawyerId",
      this.caseController.removeAssistantLawyer,
    );

    // ---------------- Opposing Lawyers ----------------

    this.router.post(
      "/:caseId/opposing-lawyers",
      this.caseController.addOpposingLawyer,
    );

    this.router.patch(
      "/:caseId/opposing-lawyers/:opposingLawyerId",
      this.caseController.updateOpposingLawyer,
    );

    this.router.delete(
      "/:caseId/opposing-lawyers/:opposingLawyerId",
      this.caseController.removeOpposingLawyer,
    );

    // ---------------- Related People ----------------

    this.router.post(
      "/:caseId/related-people",
      this.caseController.addRelatedPerson,
    );

    this.router.patch(
      "/:caseId/related-people/:relatedPersonId",
      this.caseController.updateRelatedPerson,
    );

    this.router.delete(
      "/:caseId/related-people/:relatedPersonId",
      this.caseController.removeRelatedPerson,
    );
  }
}

export default CaseRoute;
