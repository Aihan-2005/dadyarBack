import type { ClientSession, UpdateQuery } from "mongoose";

import { env } from "../config/env";

import { PAYMENT_METHODS } from "../constants/casePayment.constants";

import { MESSAGES } from "../constants/messages.constants";

import { HttpException } from "../exceptions/httpException";

import type {
  CasePayment,
  CasePaymentInput,
  CasePaymentSyncClient,
  CreateCasePaymentInput,
} from "../interfaces/casePayment.interface";

import { CasePaymentRepository } from "../repositories/casePayment.repository";

const LANGUAGE = env.LANGUAGE;

export class CasePaymentService {
  constructor(private readonly repository = new CasePaymentRepository()) {}

  // ---------------- Helpers ----------------

  private normalizeOptionalString(value?: string | null): string | undefined {
    return value?.trim() || undefined;
  }

  private ensurePaymentMethodValid(payment: CasePaymentInput): void {
    if (
      payment.method === PAYMENT_METHODS.NON_CASH &&
      !this.normalizeOptionalString(payment.description)
    ) {
      throw new HttpException(
        400,

        MESSAGES.nonCashPaymentDescriptionRequired[LANGUAGE],

        "NON_CASH_PAYMENT_DESCRIPTION_REQUIRED",
      );
    }
  }

  private ensurePaymentsWithinAssignedAmount(
    payments: ReadonlyArray<{
      amount: number;
    }>,
    assignedAmount: number,
  ): void {
    const total = payments.reduce(
      (currentTotal, payment) => currentTotal + payment.amount,
      0,
    );

    if (total > assignedAmount) {
      throw new HttpException(
        400,

        MESSAGES.paymentTotalExceedsAssignedAmount[LANGUAGE],

        "PAYMENT_TOTAL_EXCEEDS_ASSIGNED_AMOUNT",
      );
    }
  }

  private buildPaymentUpdate(
    payment: CasePaymentInput,
  ): UpdateQuery<CasePayment> {
    const setFields: Record<string, unknown> = {
      method: payment.method,

      amount: payment.amount,

      isPaid: payment.isPaid,
    };

    const unsetFields: Record<string, 1> = {};

    const description = this.normalizeOptionalString(payment.description);

    if (description) {
      setFields.description = description;
    } else {
      unsetFields.description = 1;
    }

    if (payment.dueDate) {
      setFields.dueDate = payment.dueDate;
    } else {
      unsetFields.dueDate = 1;
    }

    const update: UpdateQuery<CasePayment> = {
      $set: setFields,
    };

    if (Object.keys(unsetFields).length > 0) {
      update.$unset = unsetFields;
    }

    return update;
  }

  // ---------------- Sync ----------------

  public async syncCasePayments(
    lawyerId: string,
    caseId: string,
    clients: CasePaymentSyncClient[],
    session: ClientSession,
  ): Promise<void> {
    const existingPayments = await this.repository.findByCaseIdForLawyer(
      lawyerId,
      caseId,
      session,
    );

    const existingById = new Map(
      existingPayments.map((payment) => [payment._id.toString(), payment]),
    );

    /*
     * Every existing payment that should
     * survive the synchronization is added here.
     */
    const retainedPaymentIds = new Set<string>();

    /*
     * Protects against submitting the same
     * existing payment twice.
     */
    const submittedPaymentIds = new Set<string>();

    for (const client of clients) {
      const existingClientPayments = existingPayments.filter(
        (payment) => payment.clientId.toString() === client.clientId,
      );

      /*
       * payments omitted:
       *
       * PATCH semantics = don't modify them.
       *
       * But we still validate them against
       * the possibly changed assignedAmount.
       */
      if (client.payments === undefined) {
        this.ensurePaymentsWithinAssignedAmount(
          existingClientPayments,
          client.assignedAmount,
        );

        for (const payment of existingClientPayments) {
          retainedPaymentIds.add(payment._id.toString());
        }

        continue;
      }

      /*
       * payments supplied:
       *
       * They represent the desired final
       * payment list for this client.
       */
      this.ensurePaymentsWithinAssignedAmount(
        client.payments,
        client.assignedAmount,
      );

      for (const payment of client.payments) {
        this.ensurePaymentMethodValid(payment);

        // ---------------- Existing Payment ----------------

        if (payment.paymentId) {
          if (submittedPaymentIds.has(payment.paymentId)) {
            throw new HttpException(
              400,

              MESSAGES.duplicatePaymentInRequest[LANGUAGE],

              "DUPLICATE_PAYMENT_IN_REQUEST",
            );
          }

          submittedPaymentIds.add(payment.paymentId);

          const existingPayment = existingById.get(payment.paymentId);

          /*
           * It must belong to this exact
           * case + client.
           */
          if (
            !existingPayment ||
            existingPayment.clientId.toString() !== client.clientId
          ) {
            throw new HttpException(
              404,

              MESSAGES.paymentNotFound[LANGUAGE],

              "PAYMENT_NOT_FOUND",
            );
          }

          const updated =
            await this.repository.updateByIdForCaseClientForLawyer(
              lawyerId,
              caseId,
              client.clientId,
              payment.paymentId,
              this.buildPaymentUpdate(payment),
              session,
            );

          if (!updated) {
            throw new HttpException(
              404,

              MESSAGES.paymentNotFound[LANGUAGE],

              "PAYMENT_NOT_FOUND",
            );
          }

          retainedPaymentIds.add(payment.paymentId);

          continue;
        }

        // ---------------- New Payment ----------------

        const {
          paymentId: _paymentId,

          ...paymentData
        } = payment;

        const createData: CreateCasePaymentInput = {
          ...paymentData,

          description: this.normalizeOptionalString(paymentData.description),
        };

        await this.repository.create(
          lawyerId,
          caseId,
          client.clientId,
          createData,
          session,
        );
      }
    }

    /*
     * Anything that existed before but wasn't
     * retained has disappeared from the form.
     *
     * That means:
     *
     * - payment removed from a client
     * - payments: []
     * - client removed from the case
     *
     * All of those are deliberate deletions.
     */
    const paymentIdsToDelete = existingPayments
      .filter((payment) => !retainedPaymentIds.has(payment._id.toString()))
      .map((payment) => payment._id.toString());

    await this.repository.deleteManyByIdsForCaseForLawyer(
      lawyerId,
      caseId,
      paymentIdsToDelete,
      session,
    );
  }

  // ---------------- read ----------------
  public async getCasePayments(lawyerId: string, caseId: string) {
    return this.repository.findByCaseIdForLawyer(lawyerId, caseId);
  }
}
