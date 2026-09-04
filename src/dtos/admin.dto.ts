import type { LawyerStatus } from "../constants/lawyer.constants";

import { toPublicLawyerDTO, type PublicLawyerDTO } from "./lawyer.dto";

import type { LawyerRecord } from "../interfaces/lawyer.interface";

import type { UserRecord, UserStatus } from "../interfaces/user.interface";
import { PublicUserDTO, toPublicUserDTO } from "./user.dto";

export interface AdminLawyerDTO extends Omit<PublicLawyerDTO, "status"> {
  accountStatus: UserStatus;
  lawyerStatus: LawyerStatus;
}

export function toAdminLawyerDTO(
  lawyer: LawyerRecord,
  user: UserRecord,
): AdminLawyerDTO {
  const publicLawyer = toPublicLawyerDTO(lawyer, user);

  const { status: lawyerStatus, ...rest } = publicLawyer;

  return {
    ...rest,

    accountStatus: user.status,
    lawyerStatus,
  };
}

// ---------------- Lawyer list ----------------

export interface AdminLawyerListItemDTO {
  id: string;

  firstName: string;
  lastName: string;

  email: string | null;
  phone: string | null;

  licenseNumber: string;
  specialization: string;

  accountStatus: UserStatus;
  lawyerStatus: LawyerStatus;

  verification: AdminLawyerDTO["verification"];

  lastLoginAt: string | null;
  createdAt: string | null;
}

export function toAdminLawyerListItemDTO(
  lawyer: LawyerRecord,
  user: UserRecord,
): AdminLawyerListItemDTO {
  const lawyerDTO = toAdminLawyerDTO(lawyer, user);

  return {
    id: lawyerDTO.id,

    firstName: lawyerDTO.firstName,
    lastName: lawyerDTO.lastName,

    email: lawyerDTO.email,
    phone: lawyerDTO.profile.phone || null,

    licenseNumber: lawyerDTO.profile.licenseNumber,

    specialization: lawyerDTO.profile.specialization,

    accountStatus: lawyerDTO.accountStatus,

    lawyerStatus: lawyerDTO.lawyerStatus,

    verification: lawyerDTO.verification,

    lastLoginAt: lawyerDTO.lastLoginAt,

    createdAt: lawyerDTO.createdAt,
  };
}

// ---------------- Client list ----------------

export interface AdminClientListItemDTO extends Omit<PublicUserDTO, "status"> {
  accountStatus: UserStatus;

  createdAt: string | null;
}

export function toAdminClientListItemDTO(
  user: UserRecord,
): AdminClientListItemDTO {
  const userDTO = toPublicUserDTO(user);

  const { status, ...rest } = userDTO;

  return {
    ...rest,

    accountStatus: status,

    createdAt: user.createdAt?.toISOString() ?? null,
  };
}
