import { z } from "zod";

import { SKILL_LEVELS } from "../models/lawyer.model";

const PERSIAN_DIGITS = "۰۱۲۳۴۵۶۷۸۹";
const ARABIC_DIGITS = "٠١٢٣٤٥٦٧٨٩";

const normalizePersianDigits = (
  value: string,
): string =>
  value
    .replace(/[۰-۹]/g, (character) =>
      String(
        PERSIAN_DIGITS.indexOf(character),
      ),
    )
    .replace(/[٠-٩]/g, (character) =>
      String(
        ARABIC_DIGITS.indexOf(character),
      ),
    );

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

const profileTextSchema = (
  maxLength: number,
) =>
  z.preprocess(
    (value) => {
      if (
        value === undefined ||
        value === null
      ) {
        return "";
      }

      return value;
    },

    z
      .string()
      .trim()
      .max(maxLength),
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

      const normalized =
        normalizePersianDigits(
          String(value),
        ).trim();

      return normalized === ""
        ? undefined
        : normalized;
    },

    z
      .string()
      .regex(
        /^09\d{9}$/,
        "شماره موبایل باید ۱۱ رقم و با ۰۹ شروع شود",
      )
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

      if (typeof value !== "string") {
        return value;
      }

      const trimmed = value.trim();

      if (trimmed === "") {
        return undefined;
      }

      return /^https?:\/\//i.test(trimmed)
        ? trimmed
        : `https://${trimmed}`;
    },

    z
      .string()
      .url("آدرس وب‌سایت معتبر نیست")
      .max(
        500,
        "آدرس وب‌سایت بیش از حد طولانی است",
      )
      .optional(),
  );

const yearsOfExperienceSchema =
  z.preprocess(
    (value) => {
      if (
        value === undefined ||
        value === null ||
        value === ""
      ) {
        return 0;
      }

      if (typeof value === "string") {
        const normalized =
          normalizePersianDigits(
            value.trim(),
          );

        return normalized === ""
          ? 0
          : Number(normalized);
      }

      return value;
    },

    z
      .number()
      .int(
        "سابقه کاری باید عدد صحیح باشد",
      )
      .min(
        0,
        "سابقه کاری نمی‌تواند منفی باشد",
      )
      .max(
        80,
        "سابقه کاری نمی‌تواند بیشتر از ۸۰ سال باشد",
      ),
  );

const yearSchema = z
  .string()
  .trim()
  .transform(
    normalizePersianDigits,
  )
  .refine(
    (value) =>
      /^(13|14)\d{2}$/.test(value),
    {
      message:
        "سال باید چهاررقمی باشد",
    },
  );

const endYearSchema = z
  .string()
  .trim()
  .transform((value) => {
    if (
      value === "" ||
      value === "تا کنون" ||
      value === "تاکنون"
    ) {
      return "اکنون";
    }

    return normalizePersianDigits(value);
  })
  .refine(
    (value) =>
      value === "اکنون" ||
      /^(13|14)\d{2}$/.test(value),
    {
      message:
        "سال پایان باید چهاررقمی یا «اکنون» باشد",
    },
  );

const educationSchema = z
  .object({
    id: z
      .string()
      .trim()
      .max(100)
      .optional(),

    degree:
      profileTextSchema(120),

    field:
      profileTextSchema(120),

    university:
      profileTextSchema(160),

    year: profileTextSchema(20)
      .transform(
        normalizePersianDigits,
      ),
  })
  .strict()
  .superRefine(
    (data, context) => {
      const hasValue =
        data.degree !== "" ||
        data.field !== "" ||
        data.university !== "" ||
        data.year !== "";

      if (!hasValue) {
        context.addIssue({
          code: "custom",

          message:
            "حداقل یکی از اطلاعات سابقه تحصیلی باید تکمیل شود",
        });
      }
    },
  );

const experienceSchema = z
  .object({
    id: z
      .string()
      .trim()
      .max(100)
      .optional(),

    title: z
      .string()
      .trim()
      .min(
        1,
        "عنوان شغلی الزامی است",
      )
      .max(150),

    company: z
      .string()
      .trim()
      .min(
        1,
        "نام شرکت یا دفتر الزامی است",
      )
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
        data.endYear !== "اکنون" &&
        Number(data.endYear) <
          Number(data.startYear)
      ) {
        context.addIssue({
          code: "custom",
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
      typeof value === "string"
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
      .trim()
      .max(100)
      .optional(),

    name: z
      .string()
      .trim()
      .min(
        1,
        "نام مهارت الزامی است",
      )
      .max(100),

    level:
      skillLevelSchema,
  })
  .strict();

const languageSchema = z
  .string()
  .trim()
  .min(
    1,
    "نام زبان نمی‌تواند خالی باشد",
  )
  .max(
    80,
    "نام زبان بیش از حد طولانی است",
  );

export const LawyerProfileSchema =
  z
    .object({
      specialization:
        profileTextSchema(150),

      licenseNumber:
        profileTextSchema(50),

      yearsOfExperience:
        yearsOfExperienceSchema,

      phone:
        optionalPhoneSchema,

      website:
        optionalWebsiteSchema,

      address:
        profileTextSchema(500),

      bio:
        profileTextSchema(2000),

      education: z
        .array(educationSchema)
        .max(30)
        .default([]),

      experience: z
        .array(experienceSchema)
        .max(30)
        .default([]),

      skills: z
        .array(skillSchema)
        .max(50)
        .default([]),

      languages: z
        .array(languageSchema)
        .max(30)
        .default([])
        .transform((languages) => {
          const uniqueLanguages =
            new Map<string, string>();

          for (
            const language of languages
          ) {
            const key =
              language.toLocaleLowerCase(
                "fa-IR",
              );

            if (
              !uniqueLanguages.has(key)
            ) {
              uniqueLanguages.set(
                key,
                language,
              );
            }
          }

          return Array.from(
            uniqueLanguages.values(),
          );
        }),
    })
    .strict();

export type LawyerProfileInput =
  z.output<
    typeof LawyerProfileSchema
  >;

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