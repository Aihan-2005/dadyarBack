import mongoose, { Types, type UpdateQuery } from "mongoose";

import { env } from "../config/env";

import { LAWYER_STATUSES } from "../constants/lawyer.constants";

import { MESSAGES } from "../constants/messages.constants";

import { toLawyerProfileDTO, toPublicLawyerDTO } from "../dtos/lawyer.dto";

import { HttpException } from "../exceptions/httpException";

import type {
  Lawyer,
  LawyerProfileInput,
} from "../interfaces/lawyer.interface";

import { LawyerRepository } from "../repositories/lawyer.repository";

import { UserRepository } from "../repositories/user.repository";

const LANGUAGE = env.LANGUAGE;

export class LawyerService {
  constructor(
    private readonly repo = new LawyerRepository(),
    private readonly userRepo = new UserRepository(),
  ) {}

  private normalizePhone(phone?: string): string | undefined {
    return phone?.trim() || undefined;
  }

  private normalizeLicenseNumber(licenseNumber: string): string | undefined {
    return licenseNumber.trim() || undefined;
  }

  private sameLawyer(recordId: unknown, lawyerId: string): boolean {
    return String(recordId) === lawyerId;
  }

  private preserveSubdocumentId(id?: string): Types.ObjectId | undefined {
    return id && Types.ObjectId.isValid(id)
      ? new Types.ObjectId(id)
      : undefined;
  }

  public async findById(lawyerId: string) {
    const [lawyer, user] = await Promise.all([
      this.repo.findById(lawyerId),

      this.userRepo.findById(lawyerId),
    ]);

    if (!lawyer || !user) {
      return null;
    }

    return toPublicLawyerDTO(lawyer, user);
  }

  public async findProfileById(lawyerId: string) {
    const [lawyer, user] = await Promise.all([
      this.repo.findById(lawyerId),

      this.userRepo.findById(lawyerId),
    ]);

    if (!lawyer || !user) {
      throw new HttpException(
        404,

        MESSAGES.noUserWithId[LANGUAGE],

        "LAWYER_NOT_FOUND",
      );
    }

    return toLawyerProfileDTO(lawyer, user);
  }

  public async updateProfile(lawyerId: string, input: LawyerProfileInput) {
    const [current, currentUser] = await Promise.all([
      this.repo.findById(lawyerId),

      this.userRepo.findById(lawyerId),
    ]);

    if (!current || !currentUser) {
      throw new HttpException(
        404,

        MESSAGES.noUserWithId[LANGUAGE],

        "LAWYER_NOT_FOUND",
      );
    }

    const normalizedPhone = this.normalizePhone(input.phone);

    const normalizedLicense = this.normalizeLicenseNumber(input.licenseNumber);

    if (!normalizedPhone && !currentUser.email) {
      throw new HttpException(
        400,
        MESSAGES.noEmailNorPhone[LANGUAGE],
        "EMAIL_OR_PHONE_REQUIRED",
      );
    }

    const phoneChanged = normalizedPhone !== currentUser.phone;

    const licenseChanged = normalizedLicense !== current.licenseNumber;

    const [phoneOwner, licenseOwner] = await Promise.all([
      normalizedPhone && phoneChanged
        ? this.userRepo.findByPhone(normalizedPhone)
        : Promise.resolve(null),

      normalizedLicense && licenseChanged
        ? this.repo.findByLicenseNumber(normalizedLicense)
        : Promise.resolve(null),
    ]);

    if (phoneOwner && !this.sameLawyer(phoneOwner._id, lawyerId)) {
      throw new HttpException(
        409,
        MESSAGES.phoneExsist[LANGUAGE],
        "PHONE_ALREADY_EXISTS",
      );
    }

    if (licenseOwner && !this.sameLawyer(licenseOwner._id, lawyerId)) {
      throw new HttpException(
        409,
        MESSAGES.barExsist[LANGUAGE],
        "LICENSE_NUMBER_ALREADY_EXISTS",
      );
    }

    const setFields: Record<string, unknown> = {
      specialization: input.specialization,

      yearsOfExperience: input.yearsOfExperience,

      address: input.address,

      bio: input.bio,

      education: input.education.map((item) => {
        const _id = this.preserveSubdocumentId(item.id);

        return {
          ...(_id ? { _id } : {}),

          degree: item.degree,

          field: item.field,

          university: item.university,

          year: item.year,
        };
      }),

      experience: input.experience.map((item) => {
        const _id = this.preserveSubdocumentId(item.id);

        return {
          ...(_id ? { _id } : {}),

          title: item.title,

          company: item.company,

          startYear: item.startYear,

          endYear: item.endYear,

          description: item.description ?? "",
        };
      }),

      skills: input.skills.map((item) => {
        const _id = this.preserveSubdocumentId(item.id);

        return {
          ...(_id ? { _id } : {}),

          name: item.name,

          level: item.level,
        };
      }),

      languages: input.languages,
    };

    const unsetFields: Record<string, 1> = {};

    if (input.website) {
      setFields.website = input.website;
    } else {
      unsetFields.website = 1;
    }

    if (normalizedLicense) {
      setFields.licenseNumber = normalizedLicense;
    } else {
      unsetFields.licenseNumber = 1;
    }

    if (licenseChanged) {
      setFields.licenseVerifiedAt = null;

      if (current.status === LAWYER_STATUSES.ACTIVE) {
        setFields.status = LAWYER_STATUSES.PENDING_VERIFICATION;
      }
    }

    const update: UpdateQuery<Lawyer> = {
      $set: setFields,
    };

    if (Object.keys(unsetFields).length > 0) {
      update.$unset = unsetFields;
    }

    if (!phoneChanged) {
      const updated = await this.repo.updateProfileById(lawyerId, update);

      if (!updated) {
        throw new HttpException(
          404,

          MESSAGES.noUserWithId[LANGUAGE],

          "LAWYER_NOT_FOUND",
        );
      }

      return toLawyerProfileDTO(updated, currentUser);
    }

    const session = await mongoose.startSession();

    try {
      const result = await session.withTransaction(async () => {
        const updatedLawyer = await this.repo.updateProfileById(
          lawyerId,
          update,
          session,
        );

        const updatedUser = await this.userRepo.updatePhoneById(
          lawyerId,
          normalizedPhone,
          session,
        );

        if (!updatedLawyer || !updatedUser) {
          throw new HttpException(
            404,

            MESSAGES.noUserWithId[LANGUAGE],

            "LAWYER_NOT_FOUND",
          );
        }

        return {
          updatedLawyer,
          updatedUser,
        };
      });

      if (!result) {
        throw new HttpException(
          500,

          MESSAGES.serverError[LANGUAGE],

          "PROFILE_UPDATE_FAILED",
        );
      }

      return toLawyerProfileDTO(result.updatedLawyer, result.updatedUser);
    } finally {
      await session.endSession();
    }
  }
}
