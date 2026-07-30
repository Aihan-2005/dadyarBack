import type { UpdateQuery } from "mongoose";

import {
  DEFAULT_LAWYER_ROLE,
  DEFAULT_LAWYER_STATUS,
} from "../constants/lawyer.constants";

import type {
  CreateLawyerInput,
  Lawyer,
  LawyerAccessContext,
  LawyerAuthRecord,
  LawyerRecord,
} from "../interfaces/lawyer.interface";

import LawyerModel from "../models/lawyer.model";
import { BaseRepository } from "./base.repository";

export class LawyerRepository extends BaseRepository<Lawyer> {
  constructor() {
    super(LawyerModel);
  }

  public findByEmail(email: string) {
    return this.model.findOne({ email }).lean<LawyerRecord>().exec();
  }

  public findByPhone(phone: string) {
    return this.model.findOne({ phone }).lean<LawyerRecord>().exec();
  }

  public findByLicenseNumber(licenseNumber: string) {
    return this.model
      .findOne({
        licenseNumber,
      })
      .lean<LawyerRecord>()
      .exec();
  }

  public findById(id: string) {
    return this.model.findById(this.toObjectId(id)).lean<LawyerRecord>().exec();
  }

  public findAccessContextById(id: string) {
    return this.model
      .findById(this.toObjectId(id))
      .select("_id role status")
      .lean<LawyerAccessContext>()
      .exec();
  }

  public findAuthByEmail(email: string) {
    return this.model
      .findOne({ email })
      .select("+password")
      .lean<LawyerAuthRecord>()
      .exec();
  }

  public findAuthByPhone(phone: string) {
    return this.model
      .findOne({ phone })
      .select("+password")
      .lean<LawyerAuthRecord>()
      .exec();
  }

  public create(data: CreateLawyerInput) {
    return this.model.create({
      ...data,

      role: DEFAULT_LAWYER_ROLE,

      status: DEFAULT_LAWYER_STATUS,

      emailVerifiedAt: null,

      phoneVerifiedAt: null,

      licenseVerifiedAt: null,

      lastLoginAt: null,

      specialization: "",

      yearsOfExperience: 0,

      address: "",

      bio: "",

      experience: [],

      skills: [],
    });
  }

  public updateLastLogin(id: string, lastLoginAt: Date) {
    return this.model
      .updateOne(
        {
          _id: this.toObjectId(id),
        },
        {
          $set: {
            lastLoginAt,
          },
        },
      )
      .exec();
  }

  public updateProfileById(id: string, update: UpdateQuery<Lawyer>) {
    return this.model
      .findByIdAndUpdate(this.toObjectId(id), update, {
        new: true,
        runValidators: true,
      })
      .lean<LawyerRecord>()
      .exec();
  }
}
