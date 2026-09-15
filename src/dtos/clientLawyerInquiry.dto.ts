import type {
  ClientLawyerInquiryStatus,
} from "../constants/clientLawyerInquiry.constants";

import type {
  ClientLawyerInquiryRecord,
} from "../interfaces/clientLawyerInquiry.interface";

import type {
  ClientProfileRecord,
} from "../interfaces/clientProfile.interface";

import type {
  LawyerRecord,
} from "../interfaces/lawyer.interface";

import type {
  UserRecord,
} from "../interfaces/user.interface";

export interface ClientLawyerInquiryDTO {
  id: string;

  lawyerClientId:
    string | null;

  subject:
    string;

  description:
    string;

  status:
    ClientLawyerInquiryStatus;

  lawyerResponse:
    string;

  respondedAt:
    string | null;

  cancelledAt:
    string | null;

  closedAt:
    string | null;

  createdAt:
    string;

  updatedAt:
    string;

  lawyer: {
    id:
      string;

    firstName:
      string;

    lastName:
      string;

    fullName:
      string;

    specialization:
      string;
  };
}

export interface LawyerClientInquiryDTO {
  id: string;

  lawyerClientId:
    string | null;

  subject:
    string;

  description:
    string;

  status:
    ClientLawyerInquiryStatus;

  lawyerResponse:
    string;

  respondedAt:
    string | null;

  cancelledAt:
    string | null;

  closedAt:
    string | null;

  createdAt:
    string;

  updatedAt:
    string;

  client: {
    id:
      string;

    fullName:
      string;

    phone:
      string | null;

    email:
      string | null;
  };
}

const dateToIso = (
  value?:
    Date | null,
): string | null =>
  value
    ? value.toISOString()
    : null;

const lawyerClientIdToString = (
  inquiry:
    ClientLawyerInquiryRecord,
): string | null =>
  inquiry.lawyerClientId
    ?.toString() ??
  null;

export function toClientLawyerInquiryDTO(
  inquiry:
    ClientLawyerInquiryRecord,

  lawyer:
    LawyerRecord,
): ClientLawyerInquiryDTO {
  const firstName =
    lawyer.firstName ??
    "";

  const lastName =
    lawyer.lastName ??
    "";

  return {
    id:
      inquiry._id.toString(),

    lawyerClientId:
      lawyerClientIdToString(
        inquiry,
      ),

    subject:
      inquiry.subject,

    description:
      inquiry.description,

    status:
      inquiry.status,

    lawyerResponse:
      inquiry.lawyerResponse ??
      "",

    respondedAt:
      dateToIso(
        inquiry.respondedAt,
      ),

    cancelledAt:
      dateToIso(
        inquiry.cancelledAt,
      ),

    closedAt:
      dateToIso(
        inquiry.closedAt,
      ),

    createdAt:
      inquiry.createdAt
        .toISOString(),

    updatedAt:
      inquiry.updatedAt
        .toISOString(),

    lawyer: {
      id:
        lawyer._id.toString(),

      firstName,

      lastName,

      fullName:
        [
          firstName,
          lastName,
        ]
          .filter(
            Boolean,
          )
          .join(
            " ",
          ),

      specialization:
        lawyer.specialization ??
        "",
    },
  };
}

export function toLawyerClientInquiryDTO(
  inquiry:
    ClientLawyerInquiryRecord,

  client:
    UserRecord,

  profile?:
    ClientProfileRecord | null,
): LawyerClientInquiryDTO {
  return {
    id:
      inquiry._id.toString(),

    lawyerClientId:
      lawyerClientIdToString(
        inquiry,
      ),

    subject:
      inquiry.subject,

    description:
      inquiry.description,

    status:
      inquiry.status,

    lawyerResponse:
      inquiry.lawyerResponse ??
      "",

    respondedAt:
      dateToIso(
        inquiry.respondedAt,
      ),

    cancelledAt:
      dateToIso(
        inquiry.cancelledAt,
      ),

    closedAt:
      dateToIso(
        inquiry.closedAt,
      ),

    createdAt:
      inquiry.createdAt
        .toISOString(),

    updatedAt:
      inquiry.updatedAt
        .toISOString(),

    client: {
      id:
        client._id.toString(),

      fullName:
        profile?.fullName ??
        "",

      phone:
        client.phone ??
        null,

      email:
        client.email ??
        null,
    },
  };
}