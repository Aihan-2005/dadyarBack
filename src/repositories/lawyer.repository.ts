import type { ClientSession, Types, UpdateQuery } from "mongoose";
import { DEFAULT_LAWYER_STATUS } from "../constants/lawyer.constants";

import type {
  CreateLawyerData,
  Lawyer,
  LawyerRecord,
} from "../interfaces/lawyer.interface";

import LawyerModel from "../models/lawyer.model";
import { BaseRepository } from "./base.repository";

export class LawyerRepository extends BaseRepository<Lawyer> {
  constructor() {
    super(LawyerModel);
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

  public async create(
    userId: Types.ObjectId,
    data: CreateLawyerData,
    session?: ClientSession,
  ) {
    const createData = {
      _id: userId,

      firstName: data.firstName,

      lastName: data.lastName,

      status: DEFAULT_LAWYER_STATUS,

      licenseVerifiedAt: null,

      specialization: "",

      yearsOfExperience: 0,

      address: "",

      bio: "",

      education: [],

      experience: [],

      skills: [],

      languages: [],
    };

    if (!session) {
      return this.model.create(createData);
    }

    const [lawyer] = await this.model.create([createData], {
      session,
    });

    return lawyer;
  }

  public updateProfileById(
    id: string,
    update: UpdateQuery<Lawyer>,
    session?: ClientSession,
  ) {
    return this.model
      .findByIdAndUpdate(this.toObjectId(id), update, {
        new: true,
        runValidators: true,
        session,
      })
      .lean<LawyerRecord>()
      .exec();
  }

  public findByIds(ids: string[]) {
    if (ids.length === 0) {
      return Promise.resolve([]);
    }

    return this.model
      .find({
        _id: {
          $in: ids.map((id) => this.toObjectId(id)),
        },
      })
      .select("firstName lastName specialization")
      .lean<LawyerRecord[]>()
      .exec();
  }
}
