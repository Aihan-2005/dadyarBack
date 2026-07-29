import { Types } from "mongoose";

import type {
  LawyerRole,
  LawyerStatus,
} from "../constants/lawyer.constants";

import {
  resolveLawyerRole,
  resolveLawyerStatus,
} from "../constants/lawyer.constants";

import type {
  LawyerRecord,
  Skill,
  SkillLevel,
  WorkExperience,
} from "../interfaces/lawyer.interface";

export interface PublicExperienceDTO {
  id: string;

  title: string;
  company: string;

  startYear: string;
  endYear: string;

  description: string;
}

export interface PublicSkillDTO {
  id: string;

  name: string;
  level: SkillLevel;
}

export interface LawyerProfileDTO {
  specialization: string;
  licenseNumber: string;

  yearsOfExperience: string;

  phone: string;
  website: string;

  address: string;
  bio: string;

  experience:
    PublicExperienceDTO[];

  skills:
    PublicSkillDTO[];
}

export interface PublicLawyerDTO {
  id: string;

  firstName: string;
  lastName: string;

  email: string | null;

  role: LawyerRole;
  status: LawyerStatus;

  verification: {
    email: {
      verified: boolean;
      verifiedAt: string | null;
    };

    phone: {
      verified: boolean;
      verifiedAt: string | null;
    };

    license: {
      verified: boolean;
      verifiedAt: string | null;
    };
  };

  profile:
    LawyerProfileDTO;

  lastLoginAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

function toId(
  value: unknown,
): string {
  if (
    value instanceof
    Types.ObjectId
  ) {
    return value.toHexString();
  }

  if (
    typeof value === "string" &&
    value.length > 0
  ) {
    return value;
  }

  throw new Error(
    "Invalid MongoDB identifier",
  );
}

function toISODate(
  value: unknown,
): string | null {
  if (value instanceof Date) {
    return value.toISOString();
  }

  if (
    typeof value === "string"
  ) {
    const date =
      new Date(value);

    if (
      !Number.isNaN(
        date.getTime(),
      )
    ) {
      return date.toISOString();
    }
  }

  return null;
}

function mapExperience(
  item: WorkExperience,
): PublicExperienceDTO {
  return {
    id:
      toId(item._id),

    title:
      item.title,

    company:
      item.company,

    startYear:
      item.startYear,

    endYear:
      item.endYear,

    description:
      item.description ?? "",
  };
}

function mapSkill(
  item: Skill,
): PublicSkillDTO {
  return {
    id:
      toId(item._id),

    name:
      item.name,

    level:
      item.level,
  };
}

export function toPublicLawyerDTO(
  lawyer: LawyerRecord,
): PublicLawyerDTO {
  const emailVerifiedAt =
    toISODate(
      lawyer.emailVerifiedAt,
    );

  const phoneVerifiedAt =
    toISODate(
      lawyer.phoneVerifiedAt,
    );

  const licenseVerifiedAt =
    toISODate(
      lawyer.licenseVerifiedAt,
    );

  return {
    id:
      toId(lawyer._id),

    firstName:
      lawyer.firstName,

    lastName:
      lawyer.lastName,

    email:
      lawyer.email ?? null,

    role:
      resolveLawyerRole(
        lawyer.role,
      ),

    status:
      resolveLawyerStatus(
        lawyer.status,
      ),

    verification: {
      email: {
        verified:
          emailVerifiedAt !==
          null,

        verifiedAt:
          emailVerifiedAt,
      },

      phone: {
        verified:
          phoneVerifiedAt !==
          null,

        verifiedAt:
          phoneVerifiedAt,
      },

      license: {
        verified:
          licenseVerifiedAt !==
          null,

        verifiedAt:
          licenseVerifiedAt,
      },
    },

    profile: {
      specialization:
        lawyer.specialization ??
        "",

      licenseNumber:
        lawyer.licenseNumber ??
        "",

  
      yearsOfExperience:
        String(
          lawyer.yearsOfExperience ??
            0,
        ),

      phone:
        lawyer.phone ?? "",

      website:
        lawyer.website ?? "",

      address:
        lawyer.address ?? "",

      bio:
        lawyer.bio ?? "",

      experience:
        (
          lawyer.experience ??
          []
        ).map(mapExperience),

      skills:
        (
          lawyer.skills ??
          []
        ).map(mapSkill),
    },

    lastLoginAt:
      toISODate(
        lawyer.lastLoginAt,
      ),

    createdAt:
      toISODate(
        lawyer.createdAt,
      ),

    updatedAt:
      toISODate(
        lawyer.updatedAt,
      ),
  };
}