import { z } from "zod";

import { SKILL_LEVELS } from "../models/lawyer.model";

const normalizePersianDigits = (
  value: string,
): string => {
  const persianDigits =
    "۰۱۲۳۴۵۶۷۸۹";

  const arabicDigits =
    "٠١٢٣٤٥٦٧٨٩";

  return value
    .replace(
      /[۰-۹]/g,
      (character) =>
        String(
          persianDigits.indexOf(
            character,
          ),
        ),
    )
    .replace(
      /[٠-٩]/g,
      (character) =>
        String(
          arabicDigits.indexOf(
            character,
          ),
        ),
    );
};

const cleanOptionalString = (
  maxLength: number,
) =>
  z.preprocess(
    (value) => {
      if (
        value === undefined ||
        value === null
      ) {
        return undefined;
      }

      if (
        typeof value === "string" &&
        value.trim() === ""
      ) {
        return undefined;
      }

      return value;
    },
    z
      .string()
      .trim()
      .max(maxLength)
      .optional(),
  );

const optionalPhoneSchema =
  z.preprocess(
    (value) => {
      if (
        value === undefined ||
        value === null
      ) {
        return undefined;
      }

      if (
        typeof value === "string" &&
        value.trim() === ""
      ) {
        return undefined;
      }

      return value;
    },
    z
      .string()
      .trim()
      .regex(/^09\d{9}$/)
      .optional(),
  );

const optionalWebsiteSchema =
  z.preprocess(
    (value) => {
      if (
        value === undefined ||
        value === null
      ) {
        return undefined;
      }

      if (
        typeof value !== "string"
      ) {
        return value;
      }

      const trimmed =
        value.trim();

      if (trimmed === "") {
        return undefined;
      }

      if (
        !/^https?:\/\//i.test(
          trimmed,
        )
      ) {
        return `https://${trimmed}`;
      }

      return trimmed;
    },
    z
      .string()
      .url()
      .max(500)
      .optional(),
  );

const yearsOfExperienceSchema =
  z.preprocess(
    (value) => {
      if (
        typeof value === "string"
      ) {
        const normalized =
          normalizePersianDigits(
            value.trim(),
          );

        if (normalized === "") {
          return 0;
        }

        return Number(normalized);
      }

      return value;
    },
    z
      .number()
      .int()
      .min(0)
      .max(80),
  );

const yearSchema = z
  .string()
  .trim()
  .transform(
    normalizePersianDigits,
  )
  .refine(
    (value) =>
      /^(13|14)\d{2}$/.test(
        value,
      ),
    {
      message:
        "سال باید چهاررقمی باشد",
    },
  );

const endYearSchema = z
  .string()
  .trim()
  .transform((value) => {
    if (value === "") {
      return "اکنون";
    }

    if (
      value === "تا کنون" ||
      value === "تاکنون"
    ) {
      return "اکنون";
    }

    return normalizePersianDigits(
      value,
    );
  })
  .refine(
    (value) =>
      value === "اکنون" ||
      /^(13|14)\d{2}$/.test(
        value,
      ),
    {
      message:
        "سال پایان باید چهاررقمی یا «اکنون» باشد",
    },
  );

const experienceSchema = z
  .object({
    /**
     * شناسه ساخته‌شده در فرانت فقط برای مدیریت local state است.
     * بک‌اند آن را ذخیره نمی‌کند.
     */
    id: z
      .string()
      .optional(),

    title: z
      .string()
      .trim()
      .min(1)
      .max(150),

    company: z
      .string()
      .trim()
      .min(1)
      .max(150),

    startYear:
      yearSchema,

    endYear:
      endYearSchema,

    description:
      cleanOptionalString(2000),
  })
  .strict()
  .superRefine(
    (data, context) => {
      if (
        data.endYear !==
          "اکنون" &&
        Number(data.endYear) <
          Number(data.startYear)
      ) {
        context.addIssue({
          code:
            z.ZodIssueCode.custom,

          path: ["endYear"],

          message:
            "سال پایان نمی‌تواند قبل از سال شروع باشد",
        });
      }
    },
  );

const skillLevelSchema =
  z.preprocess(
    (value) =>
      typeof value ===
      "string"
        ? Number(value)
        : value,
    z.union([
      z.literal(1),
      z.literal(2),
      z.literal(3),
      z.literal(4),
      z.literal(5),
    ]),
  );

const skillSchema = z
  .object({
    id: z
      .string()
      .optional(),

    name: z
      .string()
      .trim()
      .min(1)
      .max(100),

    level:
      skillLevelSchema,
  })
  .strict();

export const LawyerProfileSchema =
  z
    .object({
      specialization: z
        .string()
        .trim()
        .max(150),

      licenseNumber: z
        .string()
        .trim()
        .max(50),

      yearsOfExperience:
        yearsOfExperienceSchema,

      phone:
        optionalPhoneSchema,

      website:
        optionalWebsiteSchema,

      address: z
        .string()
        .trim()
        .max(500),

      bio: z
        .string()
        .trim()
        .max(2000),

      experience: z
        .array(
          experienceSchema,
        )
        .max(30),

      skills: z
        .array(skillSchema)
        .max(50),
    })
    .strict()
    .transform((data) => ({
      specialization:
        data.specialization,

      licenseNumber:
        data.licenseNumber,

      yearsOfExperience:
        data.yearsOfExperience,

      phone:
        data.phone,

      website:
        data.website,

      address:
        data.address,

      bio:
        data.bio,

      experience:
        data.experience.map(
          ({
            id: _id,
            ...experience
          }) => experience,
        ),

      skills:
        data.skills.map(
          ({
            id: _id,
            ...skill
          }) => skill,
        ),
    }));

export const SkillLevelsSchema =
  z.enum(
    SKILL_LEVELS.map(
      String,
    ) as [
      "1",
      "2",
      "3",
      "4",
      "5",
    ],
  );