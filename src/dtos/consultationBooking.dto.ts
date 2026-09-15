import type {
  ConsultationBookingDocument,
} from "../models/consultationBooking.model";


type ClientAccountLike = {
  _id?: unknown;
  phone?: string | null;
  email?: string | null;
};


type ClientProfileLike = {
  fullName?: string | null;
} | null;


type LawyerClientLike = {
  _id?: unknown;
} | null;


export function toConsultationBookingDTO(
  booking:
    ConsultationBookingDocument,
) {
  return {
    id:
      booking._id.toString(),

    clientId:
      booking.clientId,

    lawyerId:
      booking.lawyerId,

    availabilityId:
      booking.availabilityId ??
      null,

    type:
      booking.type,

    startsAt:
      booking.startsAt
        ? booking.startsAt.toISOString()
        : null,

    endsAt:
      booking.endsAt
        ? booking.endsAt.toISOString()
        : null,

    date:
      booking.date,

    time:
      booking.time,

    description:
      booking.description ??
      "",

    status:
      booking.status,

    createdAt:
      booking.createdAt
        ? booking.createdAt.toISOString()
        : null,

    updatedAt:
      booking.updatedAt
        ? booking.updatedAt.toISOString()
        : null,
  };
}


export function toLawyerConsultationBookingDTO(
  booking:
    ConsultationBookingDocument,

  client:
    ClientAccountLike | null,

  profile:
    ClientProfileLike,

  lawyerClient:
    LawyerClientLike,
) {
  return {
    ...toConsultationBookingDTO(
      booking,
    ),

    client: {
      id:
        booking.clientId,

      fullName:
        profile?.fullName?.trim() ??
        "",

      phone:
        client?.phone ??
        null,

      email:
        client?.email ??
        null,

      lawyerClientId:
        lawyerClient?._id
          ? String(
              lawyerClient._id,
            )
          : null,
    },
  };
}