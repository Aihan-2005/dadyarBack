import type {
  InferSchemaType,
  Types,
} from "mongoose";

import type {
  z,
} from "zod";

import {
  ClientLawyerInquirySchema,
} from "../models/clientLawyerInquiry.model";

import {
  ClientLawyerInquiryListQuerySchema,
  CreateClientLawyerInquirySchema,
  LawyerInquiryDecisionSchema,
} from "../validators/clientLawyerInquiry.validator";


export type ClientLawyerInquiry =
  InferSchemaType<
    typeof ClientLawyerInquirySchema
  >;


export type ClientLawyerInquiryRecord =
  ClientLawyerInquiry & {
    _id:
      Types.ObjectId;

    createdAt:
      Date;

    updatedAt:
      Date;
  };


export type CreateClientLawyerInquiryInput =
  z.output<
    typeof CreateClientLawyerInquirySchema
  >;


export type ClientLawyerInquiryListOptions =
  z.output<
    typeof ClientLawyerInquiryListQuerySchema
  >;


export type LawyerInquiryDecisionInput =
  z.output<
    typeof LawyerInquiryDecisionSchema
  >;