import type {
  LawyerRecord,
} from "../interfaces/lawyer.interface";

import type {
  UserRecord,
} from "../interfaces/user.interface";

export interface ClientLawyerPlacementDTO {
  lawyerId: string;

  isFeatured: boolean;

  displayOrder: number;

  addedAt: string | null;
}

export interface LawyerDirectoryDTO {
  id: string;

  firstName: string;

  lastName: string;

  fullName: string;

  phone: string | null;

  email: string | null;

  specialization: string;

  licenseNumber: string;

  yearsOfExperience: number;

  website: string | null;

  address: string;

  bio: string;

  skills: string[];

  languages: string[];

  isFeatured: boolean;

  displayOrder: number;

  publishedAt: string | null;
}

function toISODate(
  value: unknown,
): string | null {
  if (
    value instanceof Date
  ) {
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

export function toClientLawyerPlacementDTO(
  lawyer: LawyerRecord,
): ClientLawyerPlacementDTO {
  return {
    lawyerId:
      lawyer._id.toString(),

    isFeatured:
      lawyer.clientDirectory?.isFeatured ??
      false,

    displayOrder:
      lawyer.clientDirectory?.displayOrder ??
      0,

    addedAt:
      toISODate(
        lawyer.clientDirectory?.publishedAt,
      ),
  };
}

export function toLawyerDirectoryDTO(
  lawyer: LawyerRecord,
  user: UserRecord,
): LawyerDirectoryDTO {
  return {
    id:
      lawyer._id.toString(),

    firstName:
      lawyer.firstName,

    lastName:
      lawyer.lastName,

    fullName:
      `${lawyer.firstName} ${lawyer.lastName}`.trim(),

    phone:
      user.phone ??
      null,

    email:
      user.email ??
      null,

    specialization:
      lawyer.specialization ??
      "",

    licenseNumber:
      lawyer.licenseNumber ??
      "",

    yearsOfExperience:
      lawyer.yearsOfExperience ??
      0,

    website:
      lawyer.website ??
      null,

    address:
      lawyer.address ??
      "",

    bio:
      lawyer.bio ??
      "",

    skills:
      (
        lawyer.skills ??
        []
      ).map(
        (skill) =>
          skill.name,
      ),

    languages: [
      ...(
        lawyer.languages ??
        []
      ),
    ],

    isFeatured:
      lawyer.clientDirectory?.isFeatured ??
      false,

    displayOrder:
      lawyer.clientDirectory?.displayOrder ??
      0,

    publishedAt:
      toISODate(
        lawyer.clientDirectory?.publishedAt,
      ),
  };
}