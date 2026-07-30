import type { UpdateQuery } from "mongoose";

import { env } from "../config/env";

import { LAWYER_STATUSES } from "../constants/lawyer.constants";

import { MESSAGES } from "../constants/messages";

import { toPublicLawyerDTO } from "../dtos/lawyer.dto";

import { HttpException } from "../exceptions/httpException";

import type {
  Lawyer,
  UpdateLawyerProfileInput,
} from "../interfaces/lawyer.interface";

import { LawyerRepository } from "../repositories/lawyer.repository";

const LANGUAGE = env.LANGUAGE;

export class LawyerService {
  private readonly repo = new LawyerRepository();

  private normalizePhone(phone?: string): string | undefined {
    return phone?.trim() || undefined;
  }

  private normalizeLicenseNumber(licenseNumber: string): string | undefined {
    return licenseNumber.trim() || undefined;
  }

  private sameLawyer(recordId: unknown, lawyerId: string): boolean {
    return String(recordId) === lawyerId;
  }

  public async findById(lawyerId: string) {
    const lawyer = await this.repo.findById(lawyerId);

    if (!lawyer) {
      return null;
    }

    return toPublicLawyerDTO(lawyer);
  }

  public async updateProfile(
    lawyerId: string,
    input: UpdateLawyerProfileInput,
  ) {
    const current = await this.repo.findById(lawyerId);

    if (!current) {
      throw new HttpException(404, MESSAGES.noUserWithId[LANGUAGE]);
    }

    const normalizedPhone = this.normalizePhone(input.phone);

    const normalizedLicense = this.normalizeLicenseNumber(input.licenseNumber);

    if (!normalizedPhone && !current.email) {
      throw new HttpException(400, MESSAGES.noEmailNorPhone[LANGUAGE]);
    }

    const phoneChanged = normalizedPhone !== current.phone;

    const licenseChanged = normalizedLicense !== current.licenseNumber;

    const [phoneOwner, licenseOwner] = await Promise.all([
      normalizedPhone && phoneChanged
        ? this.repo.findByPhone(normalizedPhone)
        : Promise.resolve(null),

      normalizedLicense && licenseChanged
        ? this.repo.findByLicenseNumber(normalizedLicense)
        : Promise.resolve(null),
    ]);

    if (phoneOwner && !this.sameLawyer(phoneOwner._id, lawyerId)) {
      throw new HttpException(409, MESSAGES.phoneExsist[LANGUAGE]);
    }

    if (licenseOwner && !this.sameLawyer(licenseOwner._id, lawyerId)) {
      throw new HttpException(409, MESSAGES.barExsist[LANGUAGE]);
    }

    const setFields: Record<string, unknown> = {
      specialization: input.specialization.trim(),

      yearsOfExperience: input.yearsOfExperience,

      address: input.address.trim(),

      bio: input.bio.trim(),

      experience: input.experience.map((item) => ({
        title: item.title.trim(),

        company: item.company.trim(),

        startYear: item.startYear,

        endYear: item.endYear,

        description: item.description?.trim(),
      })),

      skills: input.skills.map((item) => ({
        name: item.name.trim(),

        level: item.level,
      })),
    };

    const unsetFields: Record<string, 1> = {};

    if (normalizedPhone) {
      setFields.phone = normalizedPhone;
    } else {
      unsetFields.phone = 1;
    }

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

    if (phoneChanged) {
      setFields.phoneVerifiedAt = null;
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

    const updated = await this.repo.updateProfileById(lawyerId, update);

    if (!updated) {
      throw new HttpException(404, MESSAGES.noUserWithId[LANGUAGE]);
    }

    return toPublicLawyerDTO(updated);
  }
}
