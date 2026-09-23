interface SubscriptionPlanLike {
  durationDays?:
    number |
    null

  durationMonths?:
    number |
    null

  [key:
    string]:
    unknown
}

export function resolveSubscriptionPlanDurationDays(
  plan:
    Pick<
      SubscriptionPlanLike,
      | "durationDays"
      | "durationMonths"
    >,
): number {
  if (
    typeof plan.durationDays ===
      "number" &&
    Number.isFinite(
      plan.durationDays,
    ) &&
    plan.durationDays >
      0
  ) {
    return Math.max(
      1,

      Math.round(
        plan.durationDays,
      ),
    );
  }

  if (
    typeof plan.durationMonths ===
      "number" &&
    Number.isFinite(
      plan.durationMonths,
    ) &&
    plan.durationMonths >
      0
  ) {
    return Math.max(
      1,

      Math.round(
        plan.durationMonths *
          30,
      ),
    );
  }

  throw new Error(
    "Subscription plan has no valid duration",
  );
}

export function toSubscriptionPlanDTO<
  T extends SubscriptionPlanLike,
>(
  plan:
    T,
) {
  return {
    ...plan,

    durationDays:
      resolveSubscriptionPlanDurationDays(
        plan,
      ),
  };
}