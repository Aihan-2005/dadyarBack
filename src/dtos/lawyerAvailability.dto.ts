import type {
  ConsultationType,
} from "../constants/consultationBooking.constants";

import type {
  LawyerAvailabilityRecord,
} from "../interfaces/lawyerAvailability.interface";


export interface LawyerAvailabilityDTO {
  id:
    string;

  lawyerId:
    string;

  startsAt:
    string;

  endsAt:
    string;

  consultationTypes:
    ConsultationType[];

  note:
    string;

  isActive:
    boolean;

  isReserved:
    boolean;

  createdAt:
    string;

  updatedAt:
    string;
}


export function toLawyerAvailabilityDTO(
  availability:
    LawyerAvailabilityRecord,
): LawyerAvailabilityDTO {
  return {
    id:
      availability._id.toString(),

    lawyerId:
      availability.lawyerId.toString(),

    startsAt:
      availability.startsAt.toISOString(),

    endsAt:
      availability.endsAt.toISOString(),

    consultationTypes:
      [
        ...availability.consultationTypes,
      ],

    note:
      availability.note ??
      "",

    isActive:
      availability.isActive,

    isReserved:
      availability.isReserved,

    createdAt:
      availability.createdAt.toISOString(),

    updatedAt:
      availability.updatedAt.toISOString(),
  };
}