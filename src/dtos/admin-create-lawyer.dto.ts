import type {
  LawyerStatus,
} from "../constants/lawyer.constants";

import type {
  LawyerRecord,
} from "../interfaces/lawyer.interface";

import type {
  UserRecord,
  UserStatus,
} from "../interfaces/user.interface";

export interface AdminCreateLawyerDTO {
  id: string;

  firstName: string;

  lastName: string;

  phone: string | null;

  email: string | null;

  role: "LAWYER";

  accountStatus: UserStatus;

  lawyerStatus: LawyerStatus;

  specialization: string;

  licenseNumber: string | null;

  yearsOfExperience: number;

  createdAt: string | null;
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

export function toAdminCreateLawyerDTO(
  user: UserRecord,
  lawyer: LawyerRecord,
): AdminCreateLawyerDTO {
  return {
    id:
      user._id.toString(),

    firstName:
      lawyer.firstName,

    lastName:
      lawyer.lastName,

    phone:
      user.phone ??
      null,

    email:
      user.email ??
      null,

    role:
      "LAWYER",

    accountStatus:
      user.status,

    lawyerStatus:
      lawyer.status,

    specialization:
      lawyer.specialization ??
      "",

    licenseNumber:
      lawyer.licenseNumber ??
      null,

    yearsOfExperience:
      lawyer.yearsOfExperience ??
      0,

    createdAt:
      toISODate(
        user.createdAt,
      ),
  };
}
