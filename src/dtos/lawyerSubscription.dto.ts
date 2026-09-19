import type {
  LawyerSubscription,
  LawyerSubscriptionStatus,
} from "../interfaces/lawyerSubscription.interface";

export function getLawyerSubscriptionStatus(
  subscription: Pick<LawyerSubscription, "endsAt" | "cancelledAt">,

  now = new Date(),
): LawyerSubscriptionStatus {
  if (subscription.cancelledAt) {
    return "CANCELLED";
  }

  if (subscription.endsAt <= now) {
    return "EXPIRED";
  }

  return "ACTIVE";
}

export function toLawyerSubscriptionDTO(
  subscription: LawyerSubscription,

  now = new Date(),
) {
  return {
    ...subscription,

    status: getLawyerSubscriptionStatus(subscription, now),
  };
}
