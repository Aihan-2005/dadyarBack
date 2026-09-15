import mongoose from "mongoose";

import {
  ConsultationBookingStatus,
  ConsultationType,
} from "../constants/consultationBooking.constants";

import {
  HttpException,
} from "../exceptions/httpException";

import type {
  IConsultationBooking,
} from "../interfaces/consultationBooking.interface";

import {
  ConsultationBookingRepository,
} from "../repositories/consultationBooking.repository";

import {
  LawyerAvailabilityRepository,
} from "../repositories/lawyerAvailability.repository";

import {
  ClientProfileRepository,
} from "../repositories/clientProfile.repository";

import {
  LawyerClientRepository,
} from "../repositories/lawyerClient.repository";

import {
  UserRepository,
} from "../repositories/user.repository";

import {
  toConsultationBookingDTO,
  toLawyerConsultationBookingDTO,
} from "../dtos/consultationBooking.dto";

import type {
  ConsultationBookingDocument,
} from "../models/consultationBooking.model";


interface CreateConsultationBookingInput {
  lawyerId:
    string;

  availabilityId:
    string;

  type:
    ConsultationType;

  description?:
    string;
}


export class ConsultationBookingService {
  constructor(
    private readonly repository =
      new ConsultationBookingRepository(),

    private readonly availabilityRepository =
      new LawyerAvailabilityRepository(),

    private readonly userRepository =
      new UserRepository(),

    private readonly clientProfileRepository =
      new ClientProfileRepository(),

    private readonly lawyerClientRepository =
      new LawyerClientRepository(),
  ) {}


  private async requireClientProfile(
    clientId:
      string,
  ) {
    const profile =
      await this.clientProfileRepository
        .findByUserId(
          clientId,
        );

    if (
      !profile?.fullName?.trim()
    ) {
      throw new HttpException(
        409,

        "برای رزرو مشاوره، ابتدا نام و نام خانوادگی را در پروفایل موکل ثبت کنید",

        "CLIENT_PROFILE_REQUIRED",
      );
    }

    return profile;
  }


  private buildLegacyDateParts(
    startsAt:
      Date,
  ): {
    date:
      string;

    time:
      string;
  } {
    const iso =
      startsAt.toISOString();

    return {
      date:
        iso.slice(
          0,

          10,
        ),

      time:
        iso.slice(
          11,

          16,
        ),
    };
  }


  private getAllowedCurrentStatusesForLawyer(
    status:
      ConsultationBookingStatus,
  ): ConsultationBookingStatus[] {
    switch (
      status
    ) {
      case ConsultationBookingStatus.CONFIRMED:
        return [
          ConsultationBookingStatus.PENDING,
        ];

      case ConsultationBookingStatus.REJECTED:
        return [
          ConsultationBookingStatus.PENDING,
          ConsultationBookingStatus.CONFIRMED,
        ];

      case ConsultationBookingStatus.COMPLETED:
        return [
          ConsultationBookingStatus.CONFIRMED,
        ];

      default:
        return [];
    }
  }


  private async toLawyerBookingResult(
    lawyerId:
      string,

    booking:
      ConsultationBookingDocument,
  ) {
    const clientId =
      booking.clientId;

    const [
      client,

      profile,

      lawyerClient,
    ] =
      await Promise.all([
        this.userRepository.findById(
          clientId,
        ),

        this.clientProfileRepository.findByUserId(
          clientId,
        ),

        this.lawyerClientRepository.findByUserIdForLawyer(
          lawyerId,

          clientId,
        ),
      ]);


    return toLawyerConsultationBookingDTO(
      booking,

      client,

      profile,

      lawyerClient,
    );
  }


  public async createBooking(
    clientId:
      string,

    data:
      CreateConsultationBookingInput,
  ) {
 
    
    await this.requireClientProfile(
      clientId,
    );


    const session =
      await mongoose.startSession();


    try {
      const created =
        await session.withTransaction(
          async () => {
            const slot =
              await this.availabilityRepository
                .findAvailableById(
                  data.availabilityId,

                  session,
                );


            if (
              !slot
            ) {
              throw new HttpException(
                409,

                "این زمان دیگر برای رزرو در دسترس نیست",

                "LAWYER_AVAILABILITY_NOT_AVAILABLE",
              );
            }


            if (
              slot.lawyerId.toString() !==
              data.lawyerId
            ) {
              throw new HttpException(
                409,

                "زمان انتخاب‌شده متعلق به وکیل انتخاب‌شده نیست",

                "LAWYER_AVAILABILITY_LAWYER_MISMATCH",
              );
            }


            if (
              !slot.consultationTypes.includes(
                data.type,
              )
            ) {
              throw new HttpException(
                422,

                "نوع مشاوره انتخاب‌شده برای این زمان فعال نیست",

                "LAWYER_AVAILABILITY_TYPE_NOT_SUPPORTED",
              );
            }


            if (
              slot.startsAt.getTime() <=
              Date.now()
            ) {
              throw new HttpException(
                409,

                "زمان انتخاب‌شده گذشته است",

                "LAWYER_AVAILABILITY_EXPIRED",
              );
            }


            const claimed =
              await this.availabilityRepository
                .claimSlot(
                  data.lawyerId,

                  data.availabilityId,

                  data.type,

                  session,
                );


            if (
              !claimed
            ) {
              throw new HttpException(
                409,

                "این زمان هم‌زمان توسط کاربر دیگری رزرو شده است",

                "CONSULTATION_BOOKING_SLOT_CONFLICT",
              );
            }


            const legacyDateParts =
              this.buildLegacyDateParts(
                claimed.startsAt,
              );


            const payload:
              IConsultationBooking = {
                clientId,

                lawyerId:
                  data.lawyerId,

                availabilityId:
                  claimed._id.toString(),

                type:
                  data.type,

                startsAt:
                  claimed.startsAt,

                endsAt:
                  claimed.endsAt,

                date:
                  legacyDateParts.date,

                time:
                  legacyDateParts.time,

                description:
                  data.description?.trim() ??
                  "",

                status:
                  ConsultationBookingStatus.PENDING,
              };


            return this.repository
              .create(
                payload,

                session,
              );
          },
        );


      if (
        !created
      ) {
        throw new HttpException(
          500,

          "ثبت رزرو مشاوره انجام نشد",

          "CONSULTATION_BOOKING_CREATE_FAILED",
        );
      }


      return toConsultationBookingDTO(
        created,
      );
    } finally {
      await session.endSession();
    }
  }


  public async getClientBookings(
    clientId:
      string,
  ) {
    const bookings =
      await this.repository
        .findByClient(
          clientId,
        );


    return bookings.map(
      toConsultationBookingDTO,
    );
  }


  public async getLawyerBookings(
    lawyerId:
      string,
  ) {
    const bookings =
      await this.repository
        .findByLawyer(
          lawyerId,
        );


    return Promise.all(
      bookings.map(
        (
          booking,
        ) =>
          this.toLawyerBookingResult(
            lawyerId,

            booking,
          ),
      ),
    );
  }


  public async updateStatusForLawyer(
    lawyerId:
      string,

    bookingId:
      string,

    status:
      ConsultationBookingStatus,
  ) {
    const allowedStatuses:
      ConsultationBookingStatus[] = [
        ConsultationBookingStatus.CONFIRMED,
        ConsultationBookingStatus.REJECTED,
        ConsultationBookingStatus.COMPLETED,
      ];


    if (
      !allowedStatuses.includes(
        status,
      )
    ) {
      throw new HttpException(
        400,

        "وضعیت انتخاب‌شده برای وکیل معتبر نیست",

        "INVALID_BOOKING_STATUS",
      );
    }


    const allowedCurrentStatuses =
      this.getAllowedCurrentStatusesForLawyer(
        status,
      );


    const session =
      await mongoose.startSession();


    try {
      const updated =
        await session.withTransaction(
          async () => {
            const current =
              await this.repository
                .findById(
                  bookingId,

                  session,
                );


            if (
              !current
            ) {
              throw new HttpException(
                404,

                "رزرو پیدا نشد",

                "CONSULTATION_BOOKING_NOT_FOUND",
              );
            }


            if (
              current.lawyerId !==
              lawyerId
            ) {
              throw new HttpException(
                403,

                "شما به این رزرو دسترسی ندارید",

                "CONSULTATION_BOOKING_FORBIDDEN",
              );
            }


            if (
              !allowedCurrentStatuses.includes(
                current.status,
              )
            ) {
              throw new HttpException(
                409,

                "تغییر وضعیت رزرو با وضعیت فعلی آن مجاز نیست",

                "CONSULTATION_BOOKING_INVALID_TRANSITION",
              );
            }


            const result =
              await this.repository
                .updateStatusForLawyer(
                  bookingId,

                  lawyerId,

                  allowedCurrentStatuses,

                  status,

                  session,
                );


            if (
              !result
            ) {
              throw new HttpException(
                409,

                "بروزرسانی رزرو انجام نشد؛ وضعیت رزرو هم‌زمان تغییر کرده است",

                "CONSULTATION_BOOKING_UPDATE_CONFLICT",
              );
            }


            if (
              status ===
                ConsultationBookingStatus.REJECTED &&
              current.availabilityId
            ) {
              const released =
                await this.availabilityRepository
                  .releaseSlot(
                    current.availabilityId,

                    session,
                  );


              if (
                !released
              ) {
                throw new HttpException(
                  409,

                  "آزادسازی زمان رزرو انجام نشد",

                  "LAWYER_AVAILABILITY_RELEASE_CONFLICT",
                );
              }
            }


            return result;
          },
        );


      if (
        !updated
      ) {
        throw new HttpException(
          500,

          "بروزرسانی رزرو انجام نشد",

          "CONSULTATION_BOOKING_UPDATE_FAILED",
        );
      }


      return this.toLawyerBookingResult(
        lawyerId,

        updated,
      );
    } finally {
      await session.endSession();
    }
  }


  public async cancelBooking(
    clientId:
      string,

    bookingId:
      string,
  ) {
    const allowedCurrentStatuses:
      ConsultationBookingStatus[] = [
        ConsultationBookingStatus.PENDING,
        ConsultationBookingStatus.CONFIRMED,
      ];


    const session =
      await mongoose.startSession();


    try {
      const updated =
        await session.withTransaction(
          async () => {
            const current =
              await this.repository
                .findById(
                  bookingId,

                  session,
                );


            if (
              !current
            ) {
              throw new HttpException(
                404,

                "رزرو پیدا نشد",

                "CONSULTATION_BOOKING_NOT_FOUND",
              );
            }


            if (
              current.clientId !==
              clientId
            ) {
              throw new HttpException(
                403,

                "شما به این رزرو دسترسی ندارید",

                "CONSULTATION_BOOKING_FORBIDDEN",
              );
            }


            if (
              !allowedCurrentStatuses.includes(
                current.status,
              )
            ) {
              throw new HttpException(
                409,

                "این رزرو دیگر قابل لغو نیست",

                "CONSULTATION_BOOKING_NOT_CANCELLABLE",
              );
            }


            const result =
              await this.repository
                .updateStatusForClient(
                  bookingId,

                  clientId,

                  allowedCurrentStatuses,

                  ConsultationBookingStatus.CANCELLED,

                  session,
                );


            if (
              !result
            ) {
              throw new HttpException(
                409,

                "لغو رزرو انجام نشد؛ وضعیت رزرو هم‌زمان تغییر کرده است",

                "CONSULTATION_BOOKING_CANCEL_CONFLICT",
              );
            }


            if (
              current.availabilityId
            ) {
              const released =
                await this.availabilityRepository
                  .releaseSlot(
                    current.availabilityId,

                    session,
                  );


              if (
                !released
              ) {
                throw new HttpException(
                  409,

                  "آزادسازی زمان رزرو انجام نشد",

                  "LAWYER_AVAILABILITY_RELEASE_CONFLICT",
                );
              }
            }


            return result;
          },
        );


      if (
        !updated
      ) {
        throw new HttpException(
          500,

          "لغو رزرو انجام نشد",

          "CONSULTATION_BOOKING_CANCEL_FAILED",
        );
      }


      return toConsultationBookingDTO(
        updated,
      );
    } finally {
      await session.endSession();
    }
  }
}


export default new ConsultationBookingService();


