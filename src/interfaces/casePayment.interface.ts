import { InferSchemaType } from "mongoose";

import { z } from "zod";

import { CasePaymentSchema } from "../models/casePayment.model";

import {
  CasePaymentInputSchema,
  PaymentMethodSchema,
} from "../validators/casePayment.validator";

export type CasePayment = InferSchemaType<typeof CasePaymentSchema> & {
  createdAt: Date;

  updatedAt: Date;
};

export type PaymentMethod = z.infer<typeof PaymentMethodSchema>;

export type CasePaymentInput = z.infer<typeof CasePaymentInputSchema>;

/*
 * Data used when actually inserting
 * a new CasePayment.
 *
 * paymentId does not belong to a new document.
 */
export type CreateCasePaymentInput = Omit<CasePaymentInput, "paymentId">;

/*
 * Internal structure passed from
 * CaseService to CasePaymentService.
 */
export type CasePaymentSyncClient = {
  clientId: string;

  assignedAmount: number;

  payments?: CasePaymentInput[];
};
