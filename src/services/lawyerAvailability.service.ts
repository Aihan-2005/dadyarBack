import {
  LAWYER_AVAILABILITY_MAX_LOOKAHEAD_DAYS,
} from "../constants/lawyerAvailability.constants";

import {
  HttpException,
} from "../exceptions/httpException";

import type {
  CreateLawyerAvailabilityInput,
  LawyerAvailabilityListOptions,
  UpdateLawyerAvailabilityInput,
} from "../interfaces/lawyerAvailability.interface";

import {
  LawyerAvailabilityRepository,
} from "../repositories/lawyerAvailability.repository";

import {
  LawyerRepository,
} from "../repositories/lawyer.repository";

import {
  toLawyerAvailabilityDTO,
} from "../dtos/lawyerAvailability.dto";

import {
  CreateLawyerAvailabilitySchema,
} from "../validators/lawyerAvailability.validator";


export class LawyerAvailabilityService {
  constructor(
    private readonly repository =
      new LawyerAvailabilityRepository(),

    private readonly lawyerRepository =
      new LawyerRepository(),
  ) {}


  private getDefaultRange(
    options:
      LawyerAvailabilityListOptions,
  ) {
    const now =
      new Date();


    const from =
      options.from ??
      now;


    const maximumTo =
      new Date(
        from.getTime() +
          LAWYER_AVAILABILITY_MAX_LOOKAHEAD_DAYS *
            24 *
            60 *
            60 *
            1000,
      );


    const to =
      options.to ??
      maximumTo;


    if (
      to.getTime() >
      maximumTo.getTime()
    ) {
      throw new HttpException(
        400,

        `بازه دریافت زمان‌های آزاد نمی‌تواند بیشتر از ${LAWYER_AVAILABILITY_MAX_LOOKAHEAD_DAYS} روز باشد`,

        "LAWYER_AVAILABILITY_RANGE_TOO_LARGE",
      );
    }


    return {
      from,
      to,
    };
  }


  private ensureFutureSlot(
    startsAt:
      Date,
  ): void {
    if (
      startsAt.getTime() <=
      Date.now()
    ) {
      throw new HttpException(
        422,

        "زمان شروع مشاوره باید در آینده باشد",

        "LAWYER_AVAILABILITY_MUST_BE_FUTURE",
      );
    }
  }


  private async ensureNoOverlap(
    lawyerId:
      string,

    startsAt:
      Date,

    endsAt:
      Date,

    excludeId?:
      string,
  ): Promise<void> {
    const overlap =
      await this.repository
        .findOverlap(
          lawyerId,
          startsAt,
          endsAt,
          excludeId,
        );


    if (
      overlap
    ) {
      throw new HttpException(
        409,

        "این بازه زمانی با یکی از زمان‌های ثبت‌شده وکیل تداخل دارد",

        "LAWYER_AVAILABILITY_OVERLAP",
      );
    }
  }


  
  
  private async requireDirectoryLawyer(
    lawyerId:
      string,
  ) {
    const lawyer =
      await this.lawyerRepository
        .findClientDirectoryById(
          lawyerId,
        );


    if (
      !lawyer
    ) {
      throw new HttpException(
        404,

        "وکیل موردنظر در بخش موکلین منتشر نشده است",

        "CLIENT_DIRECTORY_LAWYER_NOT_FOUND",
      );
    }


    return lawyer;
  }


  public async create(
    lawyerId:
      string,

    input:
      CreateLawyerAvailabilityInput,
  ) {
    this.ensureFutureSlot(
      input.startsAt,
    );


    await this.ensureNoOverlap(
      lawyerId,
      input.startsAt,
      input.endsAt,
    );


    const created =
      await this.repository
        .createForLawyer(
          lawyerId,
          input,
        );


    return toLawyerAvailabilityDTO(
      created,
    );
  }


  public async listForLawyer(
    lawyerId:
      string,

    options:
      LawyerAvailabilityListOptions,
  ) {
    const range =
      this.getDefaultRange(
        options,
      );


    const items =
      await this.repository
        .listForLawyer(
          lawyerId,

          {
            ...range,

            includeInactive:
              options.includeInactive,
          },
        );


    return items.map(
      toLawyerAvailabilityDTO,
    );
  }


  public async listForClient(
    lawyerId:
      string,

    options:
      LawyerAvailabilityListOptions,
  ) {
    await this.requireDirectoryLawyer(
      lawyerId,
    );


    const range =
      this.getDefaultRange(
        options,
      );


    const now =
      new Date();


    const effectiveFrom =
      range.from.getTime() <
      now.getTime()
        ? now
        : range.from;


    const items =
      await this.repository
        .listAvailableForClient(
          lawyerId,

          {
            from:
              effectiveFrom,

            to:
              range.to,

            type:
              options.type,
          },
        );


    return items.map(
      toLawyerAvailabilityDTO,
    );
  }


  public async update(
    lawyerId:
      string,

    availabilityId:
      string,

    input:
      UpdateLawyerAvailabilityInput,
  ) {
    const current =
      await this.repository
        .findByIdForLawyer(
          lawyerId,
          availabilityId,
        );


    if (
      !current
    ) {
      throw new HttpException(
        404,

        "زمان مشاوره پیدا نشد",

        "LAWYER_AVAILABILITY_NOT_FOUND",
      );
    }


    if (
      current.isReserved
    ) {
      throw new HttpException(
        409,

        "زمان رزروشده قابل ویرایش نیست",

        "LAWYER_AVAILABILITY_RESERVED",
      );
    }


    const merged =
      CreateLawyerAvailabilitySchema
        .parse({
          startsAt:
            input.startsAt ??
            current.startsAt,

          endsAt:
            input.endsAt ??
            current.endsAt,

          consultationTypes:
            input.consultationTypes ??
            current.consultationTypes,

          note:
            input.note ??
            current.note ??
            "",

          isActive:
            input.isActive ??
            current.isActive,
        });


    this.ensureFutureSlot(
      merged.startsAt,
    );


    if (
      merged.isActive
    ) {
      await this.ensureNoOverlap(
        lawyerId,
        merged.startsAt,
        merged.endsAt,
        availabilityId,
      );
    }


    const updated =
      await this.repository
        .updateUnreservedForLawyer(
          lawyerId,
          availabilityId,

          {
            $set: {
              startsAt:
                merged.startsAt,

              endsAt:
                merged.endsAt,

              consultationTypes:
                merged.consultationTypes,

              note:
                merged.note ??
                "",

              isActive:
                merged.isActive,
            },
          },
        );


    if (
      !updated
    ) {
      throw new HttpException(
        409,

        "زمان مشاوره دیگر قابل ویرایش نیست",

        "LAWYER_AVAILABILITY_UPDATE_CONFLICT",
      );
    }


    return toLawyerAvailabilityDTO(
      updated,
    );
  }


  public async remove(
    lawyerId:
      string,

    availabilityId:
      string,
  ) {
    const current =
      await this.repository
        .findByIdForLawyer(
          lawyerId,
          availabilityId,
        );


    if (
      !current
    ) {
      throw new HttpException(
        404,

        "زمان مشاوره پیدا نشد",

        "LAWYER_AVAILABILITY_NOT_FOUND",
      );
    }


    if (
      current.isReserved
    ) {
      throw new HttpException(
        409,

        "زمان رزروشده قابل حذف نیست",

        "LAWYER_AVAILABILITY_RESERVED",
      );
    }


    const deleted =
      await this.repository
        .deleteUnreservedForLawyer(
          lawyerId,
          availabilityId,
        );


    if (
      !deleted
    ) {
      throw new HttpException(
        409,

        "حذف زمان مشاوره انجام نشد",

        "LAWYER_AVAILABILITY_DELETE_CONFLICT",
      );
    }


    return {
      id:
        deleted._id.toString(),
    };
  }
}