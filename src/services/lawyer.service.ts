import { MESSAGES } from "../constants/messages";
import {
  CreateLawyerInput,
  Level,
  Skill,
  // Study,
  WorkExperience,
} from "../interfaces/lawyer.interface";
import { LawyerRepository } from "../repositories/lawyer.repository";
import { env } from "../config/env";
import { HttpException } from "../exceptions/httpException";
const LANGUAGE = env.LANGUAGE;

export class LawyerService {
  private readonly repo = new LawyerRepository();

  // ----------------------- helpers ------------------------------

  // ----------------------- Core -------------------------------

  public findById(id: string) {
    return this.repo.findById(id);
  }

  public updateProfile(
    id: string,
    patch: Partial<
      Pick<
        CreateLawyerInput,
        | "name"
        | "lastname"
        | "address"
        | "yearsOfExperience"
        | "website"
        | "bio"
      >
    >,
  ) {
    return this.repo.updateById(id, patch);
  }

  // public async addStudy(lawyerId: string, study: Study) {
  //   const updated = await this.repo.addStudy(lawyerId, study);
  //   if (!updated) throw new HttpException(404, MESSAGES.noUserWithId[LANGUAGE]);
  //   return updated;
  // }
  //
  // public async removeStudy(lawyerId: string, studyId: string) {
  //   const result = await this.repo.removeStudy(lawyerId, studyId);
  //   if (result.matchedCount === 0)
  //     throw new HttpException(404, MESSAGES.noUserWithId[LANGUAGE]);
  //   if (result.modifiedCount === 0)
  //     throw new HttpException(404, MESSAGES.noStudyWithId[LANGUAGE]);
  // }

  public async addLanguage(lawyerId: string, language: string) {
    const updated = await this.repo.addLanguage(lawyerId, language);
    if (!updated) throw new HttpException(404, MESSAGES.noUserWithId[LANGUAGE]);
    return updated;
  }

  public async removeLanguage(lawyerId: string, language: string) {
    const result = await this.repo.removeLanguage(lawyerId, language);
    if (result.matchedCount === 0)
      throw new HttpException(404, MESSAGES.noUserWithId[LANGUAGE]);
    if (result.modifiedCount === 0)
      throw new HttpException(404, MESSAGES.noLanguageFound[LANGUAGE]);
  }

  public async addSkill(lawyerId: string, name: string, level: Level) {
    const skill: Skill = { name, level };
    const updated = await this.repo.addSkill(lawyerId, skill);
    if (!updated) throw new HttpException(404, MESSAGES.noUserWithId[LANGUAGE]);
    return updated;
  }

  public async removeSkill(lawyerId: string, skillName: string) {
    const result = await this.repo.removeSkill(lawyerId, skillName);
    if (result.matchedCount === 0)
      throw new HttpException(404, MESSAGES.noUserWithId[LANGUAGE]);
    if (result.modifiedCount === 0)
      throw new HttpException(404, MESSAGES.noSkillWithName[LANGUAGE]);
  }

  public async changeSkillLevel(
    lawyerId: string,
    skillName: string,
    newLevel: Level,
  ) {
    const result = await this.repo.updateSkillLevel(
      lawyerId,
      skillName,
      newLevel,
    );
    if (result.matchedCount === 0)
      throw new HttpException(404, MESSAGES.noUserWithId[LANGUAGE]);
    if (result.modifiedCount === 0)
      throw new HttpException(404, MESSAGES.noSkillWithName[LANGUAGE]);
  }

  public async addWorkExperience(
    lawyerId: string,
    workExperience: WorkExperience,
  ) {
    const updated = await this.repo.addWorkExperience(lawyerId, workExperience);
    if (!updated) throw new HttpException(404, MESSAGES.noUserWithId[LANGUAGE]);
    return updated;
  }

  public async removeWorkExperience(
    lawyerId: string,
    workExperienceId: string,
  ) {
    const result = await this.repo.removeWorkExperience(
      lawyerId,
      workExperienceId,
    );
    if (result.matchedCount === 0)
      throw new HttpException(404, MESSAGES.noUserWithId[LANGUAGE]);
    if (result.modifiedCount === 0)
      throw new HttpException(404, MESSAGES.noWorkExperienceWithId[LANGUAGE]);
  }
}
