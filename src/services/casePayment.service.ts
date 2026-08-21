import type {
  ClientSession,
  UpdateQuery,
} from "mongoose";

import {
  env,
} from "../config/env";

import {
  PAYMENT_METHODS,
} from "../constants/casePayment.constants";

import {
  MESSAGES,
} from "../constants/messages.constants";

import {
  HttpException,
} from "../exceptions/httpException";

import type {
  CasePayment,
  CasePaymentInput,
  CasePaymentSyncClient,
  CreateCasePaymentInput,
} from "../interfaces/casePayment.interface";

import {
  CasePaymentRepository,
} from "../repositories/casePayment.repository";

const LANGUAGE =
  env.LANGUAGE;

export class CasePaymentService {
  constructor(
    private readonly repository =
      new CasePaymentRepository()
  ) {}

  private normalizeOptionalString(
    value?:
      | string
      | null
  ): string | undefined {
    return (
      value?.trim() ||
      undefined
    );
  }

  private ensurePaymentMethodValid(
    payment:
      CasePaymentInput
  ): void {
    if (
      payment.method ===
        PAYMENT_METHODS.NON_CASH &&
      !this.normalizeOptionalString(
        payment.description
      )
    ) {
      throw new HttpException(
        400,

        MESSAGES
          .nonCashPaymentDescriptionRequired[
          LANGUAGE
        ],

        "NON_CASH_PAYMENT_DESCRIPTION_REQUIRED"
      );
    }
  }

  private ensurePaymentsWithinAssignedAmount(
    payments:
      ReadonlyArray<{
        amount:
          number;
      }>,

    assignedAmount:
      number
  ): void {
    const total =
      payments.reduce(
        (
          currentTotal,
          payment
        ) =>
          currentTotal +
          payment.amount,

        0
      );

    if (
      total >
      assignedAmount
    ) {
      throw new HttpException(
        400,

        MESSAGES
          .paymentTotalExceedsAssignedAmount[
          LANGUAGE
        ],

        "PAYMENT_TOTAL_EXCEEDS_ASSIGNED_AMOUNT"
      );
    }
  }

  private buildPaymentUpdate(
    payment:
      CasePaymentInput
  ): UpdateQuery<CasePayment> {
    const setFields:
      Record<
        string,
        unknown
      > = {
        method:
          payment.method,

        amount:
          payment.amount,

        isPaid:
          payment.isPaid,
      };

    const unsetFields:
      Record<
        string,
        1
      > = {};

    const description =
      this.normalizeOptionalString(
        payment.description
      );

    if (description) {
      setFields.description =
        description;
    } else {
      unsetFields.description =
        1;
    }

    if (
      payment.dueDate
    ) {
      setFields.dueDate =
        payment.dueDate;
    } else {
      unsetFields.dueDate =
        1;
    }

    const update:
      UpdateQuery<CasePayment> = {
        $set:
          setFields,
      };

    if (
      Object.keys(
        unsetFields
      ).length >
      0
    ) {
      update.$unset =
        unsetFields;
    }

    return update;
  }

  /**
   * Synchronizes all payments of a case.
   *
   * Semantics:
   * - payments === undefined => preserve existing payments for that client.
   * - payments === []        => delete all existing payments for that client.
   * - paymentId              => update that exact payment.
   * - no paymentId           => create a new payment.
   *
   * A complete validation pass is executed before any write. This keeps
   * transaction work minimal and prevents partial mutation attempts for
   * invalid payloads.
   */
  public async syncCasePayments(
    lawyerId:
      string,

    caseId:
      string,

    clients:
      CasePaymentSyncClient[],

    session:
      ClientSession
  ): Promise<void> {
    const existingPayments =
      await this.repository
        .findByCaseIdForLawyer(
          lawyerId,
          caseId,
          session
        );

    const existingById =
      new Map(
        existingPayments.map(
          (payment) => [
            payment._id.toString(),
            payment,
          ]
        )
      );

    const retainedPaymentIds =
      new Set<string>();

    const submittedPaymentIds =
      new Set<string>();

    /*
     * Preflight validation.
     * No database mutation happens in this pass.
     */
    for (
      const client of
      clients
    ) {
      const existingClientPayments =
        existingPayments.filter(
          (payment) =>
            payment.clientId.toString() ===
            client.clientId
        );

      if (
        client.payments ===
        undefined
      ) {
        this.ensurePaymentsWithinAssignedAmount(
          existingClientPayments,
          client.assignedAmount
        );

        for (
          const payment of
          existingClientPayments
        ) {
          retainedPaymentIds.add(
            payment._id.toString()
          );
        }

        continue;
      }

      this.ensurePaymentsWithinAssignedAmount(
        client.payments,
        client.assignedAmount
      );

      for (
        const payment of
        client.payments
      ) {
        this.ensurePaymentMethodValid(
          payment
        );

        if (
          !payment.paymentId
        ) {
          continue;
        }

        if (
          submittedPaymentIds.has(
            payment.paymentId
          )
        ) {
          throw new HttpException(
            400,

            MESSAGES
              .duplicatePaymentInRequest[
              LANGUAGE
            ],

            "DUPLICATE_PAYMENT_IN_REQUEST"
          );
        }

        submittedPaymentIds.add(
          payment.paymentId
        );

        const existingPayment =
          existingById.get(
            payment.paymentId
          );

        if (
          !existingPayment ||
          existingPayment.clientId.toString() !==
            client.clientId
        ) {
          throw new HttpException(
            404,

            MESSAGES
              .paymentNotFound[
              LANGUAGE
            ],

            "PAYMENT_NOT_FOUND"
          );
        }

        retainedPaymentIds.add(
          payment.paymentId
        );
      }
    }

    /*
     * Mutation pass.
     * All references and totals are valid at this point.
     */
    for (
      const client of
      clients
    ) {
      if (
        client.payments ===
        undefined
      ) {
        continue;
      }

      for (
        const payment of
        client.payments
      ) {
        if (
          payment.paymentId
        ) {
          const updated =
            await this.repository
              .updateByIdForCaseClientForLawyer(
                lawyerId,
                caseId,
                client.clientId,
                payment.paymentId,
                this.buildPaymentUpdate(
                  payment
                ),
                session
              );

          if (!updated) {
            throw new HttpException(
              404,

              MESSAGES
                .paymentNotFound[
                LANGUAGE
              ],

              "PAYMENT_NOT_FOUND"
            );
          }

          continue;
        }

        const {
          paymentId:
            _paymentId,

          ...paymentData
        } =
          payment;

        const createData:
          CreateCasePaymentInput = {
            ...paymentData,

            description:
              this.normalizeOptionalString(
                paymentData.description
              ),
          };

        await this.repository
          .create(
            lawyerId,
            caseId,
            client.clientId,
            createData,
            session
          );
      }
    }

    /*
     * Anything that existed before but was not retained by the submitted
     * client/payment graph has been removed from the case.
     *
     * This also removes payments belonging to a client removed from the case.
     */
    const paymentIdsToDelete =
      existingPayments
        .filter(
          (payment) =>
            !retainedPaymentIds.has(
              payment._id.toString()
            )
        )
        .map(
          (payment) =>
            payment._id.toString()
        );

    await this.repository
      .deleteManyByIdsForCaseForLawyer(
        lawyerId,
        caseId,
        paymentIdsToDelete,
        session
      );
  }

  public getCasePayments(
    lawyerId:
      string,

    caseId:
      string,

    session?:
      ClientSession
  ) {
    return this.repository
      .findByCaseIdForLawyer(
        lawyerId,
        caseId,
        session
      );
  }

  public getCasesPayments(
    lawyerId:
      string,

    caseIds:
      string[],

    session?:
      ClientSession
  ) {
    return this.repository
      .findByCaseIdsForLawyer(
        lawyerId,
        caseIds,
        session
      );
  }

  public deleteCasePayments(
    lawyerId:
      string,

    caseId:
      string,

    session?:
      ClientSession
  ) {
    return this.repository
      .deleteByCaseIdForLawyer(
        lawyerId,
        caseId,
        session
      );
  }
}