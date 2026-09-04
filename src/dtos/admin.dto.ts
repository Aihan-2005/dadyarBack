import type { LawyerStatus } from "../constants/lawyer.constants";

import { toPublicLawyerDTO, type PublicLawyerDTO } from "./lawyer.dto";

import type { LawyerRecord } from "../interfaces/lawyer.interface";

import type { UserRecord, UserStatus } from "../interfaces/user.interface";

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
