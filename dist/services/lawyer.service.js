"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LawyerService = void 0;
const env_1 = require("../config/env");
const lawyer_constants_1 = require("../constants/lawyer.constants");
const messages_1 = require("../constants/messages");
const lawyer_dto_1 = require("../dtos/lawyer.dto");
const httpException_1 = require("../exceptions/httpException");
const lawyer_repository_1 = require("../repositories/lawyer.repository");
const LANGUAGE = env_1.env.LANGUAGE;
class LawyerService {
  constructor() {
    this.repo = new lawyer_repository_1.LawyerRepository();
  }
  normalizePhone(phone) {
    return phone?.trim() || undefined;
  }
  normalizeLicenseNumber(licenseNumber) {
    return licenseNumber.trim() || undefined;
  }
  sameLawyer(recordId, lawyerId) {
    return String(recordId) === lawyerId;
  }
  async findById(lawyerId) {
    const lawyer = await this.repo.findById(lawyerId);
    if (!lawyer) {
      return null;
    }
    return (0, lawyer_dto_1.toPublicLawyerDTO)(lawyer);
  }
  async updateProfile(lawyerId, input) {
    const current = await this.repo.findById(lawyerId);
    if (!current) {
      throw new httpException_1.HttpException(
        404,
        messages_1.MESSAGES.noUserWithId[LANGUAGE],
      );
    }
    const normalizedPhone = this.normalizePhone(input.phone);
    const normalizedLicense = this.normalizeLicenseNumber(input.licenseNumber);
    if (!normalizedPhone && !current.email) {
      throw new httpException_1.HttpException(
        400,
        messages_1.MESSAGES.noEmailNorPhone[LANGUAGE],
      );
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
      throw new httpException_1.HttpException(
        409,
        messages_1.MESSAGES.phoneExsist[LANGUAGE],
      );
    }
    if (licenseOwner && !this.sameLawyer(licenseOwner._id, lawyerId)) {
      throw new httpException_1.HttpException(
        409,
        messages_1.MESSAGES.barExsist[LANGUAGE],
      );
    }
    const setFields = {
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
    const unsetFields = {};
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
      if (current.status === lawyer_constants_1.LAWYER_STATUSES.ACTIVE) {
        setFields.status =
          lawyer_constants_1.LAWYER_STATUSES.PENDING_VERIFICATION;
      }
    }
    const update = {
      $set: setFields,
    };
    if (Object.keys(unsetFields).length > 0) {
      update.$unset = unsetFields;
    }
    const updated = await this.repo.updateProfileById(lawyerId, update);
    if (!updated) {
      throw new httpException_1.HttpException(
        404,
        messages_1.MESSAGES.noUserWithId[LANGUAGE],
      );
    }
    return (0, lawyer_dto_1.toPublicLawyerDTO)(updated);
  }
}
exports.LawyerService = LawyerService;
