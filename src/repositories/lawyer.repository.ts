import { CreateLawyerInput, Lawyer, Skill, Study, WorkExperience } from "../interfaces/lawyer.interface";
import LawyerModel from "../models/lawyer.model";
import { BaseRepository } from "./base.repository";

// NOTE: all public methods return promises
export class LawyerRepository extends BaseRepository<Lawyer> {

  constructor() {
    super(LawyerModel)
  }
  // Helper methods

  // Finding Methods
  public findByEmail(email: string) {
    return this.model.findOne({ email }).lean().exec();
  }

  public findByPhone(phone: string) {
    return this.model.findOne({ phone }).lean().exec();
  }

  public findByBarLicence(barLicenseNumber: string) {
    return this.model.findOne({ barLicenseNumber }).lean().exec()
  }

  public findById(id: string) {
    return this.model.findById(this.toObjectId(id)).lean().exec();
  }

  public findAuthByEmail(email: string) {
    return this.model.findOne({ email }).select("+password").lean().exec()
  }

  public findAuthByPhone(phone: string) {
    return this.model.findOne({ phone }).select("+password").lean().exec()
  }

  // Create And Updating Methods
  public create(data: CreateLawyerInput) {
    return this.model.create(data);
  }

  public updateById(id: string, data: Partial<Lawyer>) {
    return this.model.findByIdAndUpdate(this.toObjectId(id), data, { new: true }).exec()
  }

  // Password Methods
  // public getPassword(id: string | Types.ObjectId) {
  //   return this.model.findById(this.toObjectId(id)).select("+password -_id").lean().exec()
  // }

  // Study Methods
  public addStudy(lawyerId: string, study: Study) {
    return this.model.findByIdAndUpdate(
      this.toObjectId(lawyerId),
      { $push: { studies: study } },
      { new: true, runValidators: true }
    ).lean().exec();
  }

  public removeStudy(lawyerId: string, studyId: string) {
    return this.model.updateOne(
      { _id: this.toObjectId(lawyerId) },
      { $pull: { studies: { _id: this.toObjectId(studyId) } } },
    ).exec();
  }

  // Language Methods
  public addLanguage(lawyerId: string, language: string) {
    return this.model.findByIdAndUpdate(
      this.toObjectId(lawyerId),
      { $addToSet: { languages: language } },
      { new: true, runValidators: true }
    ).lean().exec();
  }

  public removeLanguage(lawyerId: string, language: string) {
    return this.model.updateOne(
      { _id: this.toObjectId(lawyerId) },
      { $pull: { languages: language } }
    ).exec();
  }

  // Skills Methods
  public addSkill(lawyerId: string, skill: Skill) {
    return this.model.findByIdAndUpdate(
      this.toObjectId(lawyerId),
      { $push: { skills: skill } },
      { new: true, runValidators: true }
    ).lean().exec();
  }

  public removeSkill(lawyerId: string, skillName: string) {
    return this.model.updateOne(
      { _id: this.toObjectId(lawyerId) },
      { $pull: { skills: { name: skillName } } }
    ).exec();
  }

  public updateSkillLevel(
    lawyerId: string,
    skillName: string,
    level: string
  ) {
    return this.model.updateOne(
      { _id: this.toObjectId(lawyerId), "skills.name": skillName },
      { $set: { "skills.$.level": level } },
      { runValidators: true }
    ).exec();
  }

  // Work Experiences Methods
  public addWorkExperience(lawyerId: string, workExperience: WorkExperience) {
    return this.model.findByIdAndUpdate(
      this.toObjectId(lawyerId),
      { $push: { workExperiences: workExperience } },
      { new: true, runValidators: true }
    ).lean().exec();
  }

  public removeWorkExperience(lawyerId: string, workExperiencesId: string) {
    return this.model.updateOne(
      { _id: this.toObjectId(lawyerId) },
      { $pull: { workExperiences: { _id: this.toObjectId(workExperiencesId) } } },
    ).exec();
  }
  // TODO: add updating the workExperience
}
