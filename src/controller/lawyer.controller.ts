import { NextFunction, Request, Response } from "express";
import { LawyerService } from "../services/lawyer.service";
import { HttpExceptoin } from "../exceptions/httpException";
import { MESSAGES } from "../constants/messages";
import { env } from "../config/env";

import {
  UpdateProfileSchema,
  AddStudySchema,
  ParamStudyIdSchema,
  LanguageBodySchema,
  AddSkillSchema,
  UpdateSkillLevelSchema,
  ParamNameSchema,
  ParamWorkExperienceIdSchema,
  AddWorkExperienceSchema,
} from "../validators/lawyer.validator";

const LANGUAGE = env.LANGUAGE;

class LawyerController {
  constructor(private readonly lawyerService: LawyerService) { }

  // GET /lawyers/me
  public me = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const lawyerId = req.user?.id;
      if (!lawyerId) throw new HttpExceptoin(401, MESSAGES.unauthorized[LANGUAGE]);

      const lawyer = await this.lawyerService.findById(lawyerId);
      if (!lawyer) throw new HttpExceptoin(404, MESSAGES.noUserWithId[LANGUAGE]);

      return res.status(200).json({ success: true, data: lawyer });
    } catch (err) {
      next(err);
    }
  };

  // PATCH /lawyers/me
  public updateMe = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const lawyerId = req.user?.id;
      if (!lawyerId) throw new HttpExceptoin(401, MESSAGES.unauthorized[LANGUAGE]);

      const patch = await UpdateProfileSchema.parseAsync(req.body);
      const updated = await this.lawyerService.updateProfile(lawyerId, patch);

      if (!updated) throw new HttpExceptoin(404, MESSAGES.noUserWithId[LANGUAGE]);

      return res.status(200).json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  };

  // ---------------- Studies ----------------

  // POST /lawyers/me/studies
  public addStudy = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const lawyerId = req.user?.id;
      if (!lawyerId) throw new HttpExceptoin(401, MESSAGES.unauthorized[LANGUAGE]);

      const study = await AddStudySchema.parseAsync(req.body);
      const updated = await this.lawyerService.addStudy(lawyerId, study);

      return res.status(201).json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  };

  // DELETE /lawyers/me/studies/:studyId
  public removeStudy = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const lawyerId = req.user?.id;
      if (!lawyerId) throw new HttpExceptoin(401, MESSAGES.unauthorized[LANGUAGE]);

      const { studyId } = ParamStudyIdSchema.parse(req.params);
      await this.lawyerService.removeStudy(lawyerId, studyId);

      return res.status(200).json({ success: true });
    } catch (err) {
      next(err);
    }
  };

  // ---------------- Languages ----------------

  // POST /lawyers/me/languages
  public addLanguage = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const lawyerId = req.user?.id;
      if (!lawyerId) throw new HttpExceptoin(401, MESSAGES.unauthorized[LANGUAGE]);

      const { language } = await LanguageBodySchema.parseAsync(req.body);
      const updated = await this.lawyerService.addLanguage(lawyerId, language);

      return res.status(201).json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  };

  // DELETE /lawyers/me/languages/:language
  public removeLanguage = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const lawyerId = req.user?.id;
      if (!lawyerId) throw new HttpExceptoin(401, MESSAGES.unauthorized[LANGUAGE]);

      const { language } = await LanguageBodySchema.parseAsync(req.params);
      await this.lawyerService.removeLanguage(lawyerId, language);

      return res.status(200).json({ success: true });
    } catch (err) {
      next(err);
    }
  };

  // ---------------- Skills ----------------

  // POST /lawyers/me/skills
  public addSkill = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const lawyerId = req.user?.id;
      if (!lawyerId) throw new HttpExceptoin(401, MESSAGES.unauthorized[LANGUAGE]);

      const { name, level } = await AddSkillSchema.parseAsync(req.body);
      const updated = await this.lawyerService.addSkill(lawyerId, name, level);

      return res.status(201).json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  };

  // DELETE /lawyers/me/skills/:name
  public removeSkill = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const lawyerId = req.user?.id;
      if (!lawyerId) throw new HttpExceptoin(401, MESSAGES.unauthorized[LANGUAGE]);

      const { name } = ParamNameSchema.parse(req.params);
      await this.lawyerService.removeSkill(lawyerId, name);

      return res.status(200).json({ success: true });
    } catch (err) {
      next(err);
    }
  };

  // PATCH /lawyers/me/skills/:name
  public changeSkillLevel = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const lawyerId = req.user?.id;
      if (!lawyerId) throw new HttpExceptoin(401, MESSAGES.unauthorized[LANGUAGE]);

      const { name } = ParamNameSchema.parse(req.params);
      const { level } = await UpdateSkillLevelSchema.parseAsync(req.body);

      await this.lawyerService.changeSkillLevel(lawyerId, name, level);

      return res.status(200).json({ success: true });
    } catch (err) {
      next(err);
    }
  };

  // ---------------- Work Experiences ----------------

  // POST /lawyers/me/work-experiences
  public addWorkExperience = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const lawyerId = req.user?.id;
      if (!lawyerId) throw new HttpExceptoin(401, MESSAGES.unauthorized[LANGUAGE]);

      const workExperience = await AddWorkExperienceSchema.parseAsync(req.body);
      const updated = await this.lawyerService.addWorkExperience(lawyerId, workExperience);

      return res.status(201).json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  };

  // DELETE /lawyers/me/work-experiences/:id
  public removeWorkExperience = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const lawyerId = req.user?.id;
      if (!lawyerId) throw new HttpExceptoin(401, MESSAGES.unauthorized[LANGUAGE]);

      const { id } = await ParamWorkExperienceIdSchema.parseAsync(req.params);
      await this.lawyerService.removeWorkExperience(lawyerId, id);

      return res.status(200).json({ success: true });
    } catch (err) {
      next(err);
    }
  };
}

export default LawyerController;
