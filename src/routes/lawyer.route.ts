import { Router } from "express";
import LawyerController from "../controller/lawyer.controller";
import { LawyerService } from "../services/lawyer.service";
import { Route } from "../interfaces/routes.interface";
import requireAuth from "../middlewere/auth.middlewere";

class LawyerRoute implements Route {
  public path = "/lawyers";
  public router = Router();
  private readonly lawyerController = new LawyerController(new LawyerService());

  constructor() {
    this.authRoutes();
    this.initilizeRoutes();
  }

  private authRoutes() {
    this.router.use(requireAuth);
  }
  private initilizeRoutes() {
    // Profile
    this.router.get("/me", this.lawyerController.me);
    this.router.patch("/me", this.lawyerController.updateMe);

    // Languages
    this.router.post("/me/languages", this.lawyerController.addLanguage);
    this.router.delete(
      "/me/languages/:language",
      this.lawyerController.removeLanguage,
    );

    // Skills
    this.router.post("/me/skills", this.lawyerController.addSkill);
    this.router.delete("/me/skills/:name", this.lawyerController.removeSkill);
    this.router.patch(
      "/me/skills/:name",
      this.lawyerController.changeSkillLevel,
    );

    // Work Experiences
    this.router.post(
      "/me/work-experiences",
      this.lawyerController.addWorkExperience,
    );
    this.router.delete(
      "/me/work-experiences/:id",
      this.lawyerController.removeWorkExperience,
    );
  }
}

export default LawyerRoute;
