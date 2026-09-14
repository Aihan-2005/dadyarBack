import type {
  ClientPetitionStatus,
} from "../constants/clientPetition.constants";

import type {
  ClientPetitionRecord,
} from "../interfaces/clientPetition.interface";


export interface ClientPetitionDTO {
  id:
    string;

  title:
    string;

  caseNumber:
    string;

  court:
    string;

  subject:
    string;

  facts:
    string;

  arguments:
    string;

  evidence:
    string[];

  requestedRelief:
    string;

  status:
    ClientPetitionStatus;

  submittedAt:
    string | null;

  createdAt:
    string;

  updatedAt:
    string;
}


export function toClientPetitionDTO(
  petition:
    ClientPetitionRecord,
): ClientPetitionDTO {
  return {
    id:
      petition._id.toString(),

    title:
      petition.title,

    caseNumber:
      petition.caseNumber ??
      "",

    court:
      petition.court ??
      "",

    subject:
      petition.subject ??
      "",

    facts:
      petition.facts ??
      "",

    arguments:
      petition.arguments ??
      "",

    evidence:
      [
        ...(
          petition.evidence ??
          []
        ),
      ],

    requestedRelief:
      petition.requestedRelief ??
      "",

    status:
      petition.status,

    submittedAt:
      petition.submittedAt
        ? petition.submittedAt.toISOString()
        : null,

    createdAt:
      petition.createdAt.toISOString(),

    updatedAt:
      petition.updatedAt.toISOString(),
  };
}