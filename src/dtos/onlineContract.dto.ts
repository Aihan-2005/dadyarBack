import type {
  OnlineContractRecord,
} from "../interfaces/onlineContract.interface";

function toISOString(
  value: unknown,
): string {
  if (
    value instanceof Date
  ) {
    return value.toISOString();
  }

  const parsed =
    new Date(
      String(
        value,
      ),
    );

  return Number.isNaN(
    parsed.getTime(),
  )
    ? ""
    : parsed.toISOString();
}

export function toOnlineContractDTO(
  contract: OnlineContractRecord,
) {
  return {
    id:
      contract._id.toString(),

    reference:
      contract.reference,

    version:
      contract.version,

    status:
      contract.status,

    templateSnapshot: {
      key:
        contract.templateSnapshot.key,

      title:
        contract.templateSnapshot.title,

      shortDescription:
        contract.templateSnapshot.shortDescription,

      lawyerObligations: [
        ...contract.templateSnapshot
          .lawyerObligations,
      ],

      clientObligations: [
        ...contract.templateSnapshot
          .clientObligations,
      ],

      standardTerms: [
        ...contract.templateSnapshot
          .standardTerms,
      ],
    },

    draft: {
      templateKey:
        contract.draft.templateKey,

      client: {
        fullName:
          contract.draft.client.fullName,

        phone:
          contract.draft.client.phone,

        nationalId:
          contract.draft.client.nationalId,

        address:
          contract.draft.client.address ||
          undefined,
      },

      lawyer: {
        id:
          contract.draft.lawyer.id,

        fullName:
          contract.draft.lawyer.fullName,

        specialization:
          contract.draft.lawyer.specialization ||
          "",

        licenseNumber:
          contract.draft.lawyer.licenseNumber ||
          "",

        address:
          contract.draft.lawyer.address ||
          "",
      },

      subject:
        contract.draft.subject,

      scope:
        contract.draft.scope,

      feeToman:
        contract.draft.feeToman,

      paymentMode:
        contract.draft.paymentMode,

      paymentDetails:
        contract.draft.paymentDetails,

      startDate:
        contract.draft.startDate,

      servicePeriod:
        contract.draft.servicePeriod,

      additionalTerms:
        contract.draft.additionalTerms ||
        undefined,
    },

    versions:
      contract.versions.map(
        (
          version,
        ) => ({
          version:
            version.version,

          draft: {
            templateKey:
              version.draft.templateKey,

            client: {
              fullName:
                version.draft.client.fullName,

              phone:
                version.draft.client.phone,

              nationalId:
                version.draft.client.nationalId,

              address:
                version.draft.client.address ||
                undefined,
            },

            lawyer: {
              id:
                version.draft.lawyer.id,

              fullName:
                version.draft.lawyer.fullName,

              specialization:
                version.draft.lawyer.specialization ||
                "",

              licenseNumber:
                version.draft.lawyer.licenseNumber ||
                "",

              address:
                version.draft.lawyer.address ||
                "",
            },

            subject:
              version.draft.subject,

            scope:
              version.draft.scope,

            feeToman:
              version.draft.feeToman,

            paymentMode:
              version.draft.paymentMode,

            paymentDetails:
              version.draft.paymentDetails,

            startDate:
              version.draft.startDate,

            servicePeriod:
              version.draft.servicePeriod,

            additionalTerms:
              version.draft.additionalTerms ||
              undefined,
          },

          createdBy:
            version.createdBy,

          createdAt:
            toISOString(
              version.createdAt,
            ),

          summary:
            version.summary,
        }),
      ),

    createdAt:
      toISOString(
        contract.createdAt,
      ),

    updatedAt:
      toISOString(
        contract.updatedAt,
      ),

    completedAt:
      contract.completedAt
        ? toISOString(
            contract.completedAt,
          )
        : undefined,

    rejectionReason:
      contract.rejectionReason ||
      undefined,

    clientFeedback:
      contract.clientFeedback ||
      undefined,

    auditTrail:
      contract.auditTrail.map(
        (
          event,
        ) => ({
          id:
            event.id,

          action:
            event.action,

          actor:
            event.actor,

          label:
            event.label,

          createdAt:
            toISOString(
              event.createdAt,
            ),
        }),
      ),
  };
}