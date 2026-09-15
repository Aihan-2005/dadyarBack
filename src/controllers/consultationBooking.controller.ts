import type {
  NextFunction,
  Request,
  Response,
} from "express";

import {
  ConsultationBookingStatus,
} from "../constants/consultationBooking.constants";

import {
  HttpException,
} from "../exceptions/httpException";

import consultationBookingService from "../services/consultationBooking.service";

import {
  createConsultationBookingSchema,
} from "../validators/consultationBooking.validator";


function requireAuthenticatedUserId(
  req:
    Request,
): string {
  const userId =
    req.user?.id;


  if (!userId) {
    throw new HttpException(
      401,

      "برای انجام این عملیات باید وارد حساب کاربری شوید",

      "UNAUTHORIZED",
    );
  }


  return userId;
}


function requireStringParam(
  req:
    Request,

  name:
    string,
): string {
  const rawValue =
    req.params[
      name
    ];


  const value =
    Array.isArray(
      rawValue,
    )
      ? rawValue[0]
      : rawValue;


  if (
    typeof value !==
      "string" ||
    !value.trim()
  ) {
    throw new HttpException(
      400,

      "شناسه ارسال‌شده معتبر نیست",

      "INVALID_ROUTE_PARAMETER",
    );
  }


  return value.trim();
}


function parseBookingStatus(
  value:
    unknown,
): ConsultationBookingStatus {
  if (
    typeof value !==
      "string"
  ) {
    throw new HttpException(
      400,

      "وضعیت رزرو الزامی است",

      "BOOKING_STATUS_REQUIRED",
    );
  }


  const statuses =
    Object.values(
      ConsultationBookingStatus,
    );


  if (
    !statuses.includes(
      value as
        ConsultationBookingStatus,
    )
  ) {
    throw new HttpException(
      400,

      "وضعیت رزرو معتبر نیست",

      "INVALID_BOOKING_STATUS",
    );
  }


  return value as
    ConsultationBookingStatus;
}


export async function createBooking(
  req:
    Request,

  res:
    Response,

  next:
    NextFunction,
): Promise<
  Response | void
> {
  try {
    const clientId =
      requireAuthenticatedUserId(
        req,
      );


    const input =
      createConsultationBookingSchema
        .parse(
          req.body ??
            {},
        );


    const result =
      await consultationBookingService
        .createBooking(
          clientId,

          input,
        );


    return res
      .status(201)
      .json({
        success:
          true,

        data:
          result,
      });
  } catch (
    error
  ) {
    return next(
      error,
    );
  }
}


export async function clientBookings(
  req:
    Request,

  res:
    Response,

  next:
    NextFunction,
): Promise<
  Response | void
> {
  try {
    const clientId =
      requireAuthenticatedUserId(
        req,
      );


    const result =
      await consultationBookingService
        .getClientBookings(
          clientId,
        );


    return res
      .status(200)
      .json({
        success:
          true,

        data:
          result,
      });
  } catch (
    error
  ) {
    return next(
      error,
    );
  }
}


export async function lawyerBookings(
  req:
    Request,

  res:
    Response,

  next:
    NextFunction,
): Promise<
  Response | void
> {
  try {
    const lawyerId =
      requireAuthenticatedUserId(
        req,
      );


    const result =
      await consultationBookingService
        .getLawyerBookings(
          lawyerId,
        );


    return res
      .status(200)
      .json({
        success:
          true,

        data:
          result,
      });
  } catch (
    error
  ) {
    return next(
      error,
    );
  }
}


export async function updateStatus(
  req:
    Request,

  res:
    Response,

  next:
    NextFunction,
): Promise<
  Response | void
> {
  try {
    const lawyerId =
      requireAuthenticatedUserId(
        req,
      );


    const bookingId =
      requireStringParam(
        req,

        "id",
      );


    const status =
      parseBookingStatus(
        req.body?.status,
      );


    const result =
      await consultationBookingService
        .updateStatusForLawyer(
          lawyerId,

          bookingId,

          status,
        );


    return res
      .status(200)
      .json({
        success:
          true,

        data:
          result,
      });
  } catch (
    error
  ) {
    return next(
      error,
    );
  }
}


export async function cancelBooking(
  req:
    Request,

  res:
    Response,

  next:
    NextFunction,
): Promise<
  Response | void
> {
  try {
    const clientId =
      requireAuthenticatedUserId(
        req,
      );


    const bookingId =
      requireStringParam(
        req,

        "id",
      );


    const result =
      await consultationBookingService
        .cancelBooking(
          clientId,

          bookingId,
        );


    return res
      .status(200)
      .json({
        success:
          true,

        data:
          result,
      });
  } catch (
    error
  ) {
    return next(
      error,
    );
  }
}