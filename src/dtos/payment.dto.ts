export function toLawyerPaymentDTO(payment: any) {
  return {
    id: payment._id.toString(),

    plan: {
      id: payment.planId.toString(),

      title: payment.planSnapshot.title,

      tier: payment.planSnapshot.tier,

      durationMonths: payment.planSnapshot.durationMonths,
    },

    amount: payment.amount,

    currency: payment.currency,

    status: payment.status,

    fulfillmentStatus: payment.fulfillmentStatus,

    referenceId: payment.referenceId ?? null,

    cardPan: payment.cardPan ?? null,

    paidAt: payment.paidAt ?? null,

    cancelledAt: payment.cancelledAt ?? null,

    failedAt: payment.failedAt ?? null,

    createdAt: payment.createdAt,

    reversedAt: payment.reversedAt,
  };
}

export function toAdminPaymentDTO(payment: any) {
  return {
    ...toLawyerPaymentDTO(payment),

    lawyerId: payment.lawyerId.toString(),

    provider: payment.provider,

    authority: payment.authority ?? null,

    providerRequestCode: payment.providerRequestCode ?? null,

    providerVerificationCode: payment.providerVerificationCode ?? null,

    providerFee: payment.providerFee ?? null,

    providerFeeType: payment.providerFeeType ?? null,

    subscriptionId: payment.subscriptionId?.toString() ?? null,

    fulfillmentErrorCode: payment.fulfillmentErrorCode ?? null,

    fulfillmentErrorMessage: payment.fulfillmentErrorMessage ?? null,

    failureCode: payment.failureCode ?? null,

    failureMessage: payment.failureMessage ?? null,

    fulfilledAt: payment.fulfilledAt ?? null,
  };
}
