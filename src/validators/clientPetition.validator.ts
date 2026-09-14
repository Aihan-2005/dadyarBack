import {
  z,
} from "zod";

import {
  CLIENT_PETITION_STATUSES,
} from "../constants/clientPetition.constants";

import {
  MongoIdSchema,
  RequiredString,
  cleanOptionalString,
} from "./common.validator";


const EvidenceItemSchema =
  z
    .string()
    .trim()
    .min(1)
    .max(1_000);


export const ClientPetitionStatusSchema =
  z.enum(
    CLIENT_PETITION_STATUSES,
  );


export const CreateClientPetitionSchema =
  z
    .object({
      title:
        RequiredString.max(
          200,
        ),

      caseNumber:
        cleanOptionalString(
          100,
        ),

      court:
        cleanOptionalString(
          200,
        ),

      subject:
        cleanOptionalString(
          500,
        ),

      facts:
        cleanOptionalString(
          10_000,
        ),

      arguments:
        cleanOptionalString(
          15_000,
        ),

      evidence:
        z
          .array(
            EvidenceItemSchema,
          )
          .max(20)
          .default([]),

      requestedRelief:
        cleanOptionalString(
          5_000,
        ),
    })
    .strict();


export const UpdateClientPetitionSchema =
  z
    .object({
      title:
        RequiredString.max(
          200,
        ).optional(),

      caseNumber:
        cleanOptionalString(
          100,
        ),

      court:
        cleanOptionalString(
          200,
        ),

      subject:
        cleanOptionalString(
          500,
        ),

      facts:
        cleanOptionalString(
          10_000,
        ),

      arguments:
        cleanOptionalString(
          15_000,
        ),

      evidence:
        z
          .array(
            EvidenceItemSchema,
          )
          .max(20)
          .optional(),

      requestedRelief:
        cleanOptionalString(
          5_000,
        ),
    })
    .strict()
    .refine(
      (value) =>
        Object.keys(
          value,
        ).length > 0,

      {
        message:
          "حداقل یک فیلد برای ویرایش لایحه لازم است",
      },
    );


export const SubmittableClientPetitionSchema =
  z.object({
    title:
      RequiredString.max(
        200,
      ),

    subject:
      RequiredString.max(
        500,
      ),

    facts:
      RequiredString.max(
        10_000,
      ),

    requestedRelief:
      RequiredString.max(
        5_000,
      ),
  });


export const ClientPetitionIdParamSchema =
  z
    .object({
      id:
        MongoIdSchema,
    })
    .strict();


export const ClientPetitionListQuerySchema =
  z
    .object({
      search:
        z
          .string()
          .trim()
          .max(200)
          .optional(),

      status:
        ClientPetitionStatusSchema
          .optional(),

      page:
        z
          .coerce
          .number()
          .int()
          .min(1)
          .default(1),

      limit:
        z
          .coerce
          .number()
          .int()
          .min(1)
          .max(100)
          .default(20),
    })
    .strict();