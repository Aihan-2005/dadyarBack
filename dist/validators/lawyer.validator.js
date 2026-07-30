"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SkillLevelsSchema = exports.LawyerProfileSchema = void 0;
const zod_1 = require("zod");
const lawyer_model_1 = require("../models/lawyer.model");
const normalizePersianDigits = (value) => {
    const persianDigits = "۰۱۲۳۴۵۶۷۸۹";
    const arabicDigits = "٠١٢٣٤٥٦٧٨٩";
    return value
        .replace(/[۰-۹]/g, (character) => String(persianDigits.indexOf(character)))
        .replace(/[٠-٩]/g, (character) => String(arabicDigits.indexOf(character)));
};
const cleanOptionalString = (maxLength) => zod_1.z.preprocess((value) => {
    if (value === undefined ||
        value === null) {
        return undefined;
    }
    if (typeof value === "string" &&
        value.trim() === "") {
        return undefined;
    }
    return value;
}, zod_1.z
    .string()
    .trim()
    .max(maxLength)
    .optional());
const optionalPhoneSchema = zod_1.z.preprocess((value) => {
    if (value === undefined ||
        value === null) {
        return undefined;
    }
    if (typeof value === "string" &&
        value.trim() === "") {
        return undefined;
    }
    return value;
}, zod_1.z
    .string()
    .trim()
    .regex(/^09\d{9}$/)
    .optional());
const optionalWebsiteSchema = zod_1.z.preprocess((value) => {
    if (value === undefined ||
        value === null) {
        return undefined;
    }
    if (typeof value !== "string") {
        return value;
    }
    const trimmed = value.trim();
    if (trimmed === "") {
        return undefined;
    }
    if (!/^https?:\/\//i.test(trimmed)) {
        return `https://${trimmed}`;
    }
    return trimmed;
}, zod_1.z
    .string()
    .url()
    .max(500)
    .optional());
const yearsOfExperienceSchema = zod_1.z.preprocess((value) => {
    if (typeof value === "string") {
        const normalized = normalizePersianDigits(value.trim());
        if (normalized === "") {
            return 0;
        }
        return Number(normalized);
    }
    return value;
}, zod_1.z
    .number()
    .int()
    .min(0)
    .max(80));
const yearSchema = zod_1.z
    .string()
    .trim()
    .transform(normalizePersianDigits)
    .refine((value) => /^(13|14)\d{2}$/.test(value), {
    message: "سال باید چهاررقمی باشد",
});
const endYearSchema = zod_1.z
    .string()
    .trim()
    .transform((value) => {
    if (value === "") {
        return "اکنون";
    }
    if (value === "تا کنون" ||
        value === "تاکنون") {
        return "اکنون";
    }
    return normalizePersianDigits(value);
})
    .refine((value) => value === "اکنون" ||
    /^(13|14)\d{2}$/.test(value), {
    message: "سال پایان باید چهاررقمی یا «اکنون» باشد",
});
const experienceSchema = zod_1.z
    .object({
    /**
     * شناسه ساخته‌شده در فرانت فقط برای مدیریت local state است.
     * بک‌اند آن را ذخیره نمی‌کند.
     */
    id: zod_1.z
        .string()
        .optional(),
    title: zod_1.z
        .string()
        .trim()
        .min(1)
        .max(150),
    company: zod_1.z
        .string()
        .trim()
        .min(1)
        .max(150),
    startYear: yearSchema,
    endYear: endYearSchema,
    description: cleanOptionalString(2000),
})
    .strict()
    .superRefine((data, context) => {
    if (data.endYear !==
        "اکنون" &&
        Number(data.endYear) <
            Number(data.startYear)) {
        context.addIssue({
            code: zod_1.z.ZodIssueCode.custom,
            path: ["endYear"],
            message: "سال پایان نمی‌تواند قبل از سال شروع باشد",
        });
    }
});
const skillLevelSchema = zod_1.z.preprocess((value) => typeof value ===
    "string"
    ? Number(value)
    : value, zod_1.z.union([
    zod_1.z.literal(1),
    zod_1.z.literal(2),
    zod_1.z.literal(3),
    zod_1.z.literal(4),
    zod_1.z.literal(5),
]));
const skillSchema = zod_1.z
    .object({
    id: zod_1.z
        .string()
        .optional(),
    name: zod_1.z
        .string()
        .trim()
        .min(1)
        .max(100),
    level: skillLevelSchema,
})
    .strict();
exports.LawyerProfileSchema = zod_1.z
    .object({
    specialization: zod_1.z
        .string()
        .trim()
        .max(150),
    licenseNumber: zod_1.z
        .string()
        .trim()
        .max(50),
    yearsOfExperience: yearsOfExperienceSchema,
    phone: optionalPhoneSchema,
    website: optionalWebsiteSchema,
    address: zod_1.z
        .string()
        .trim()
        .max(500),
    bio: zod_1.z
        .string()
        .trim()
        .max(2000),
    experience: zod_1.z
        .array(experienceSchema)
        .max(30),
    skills: zod_1.z
        .array(skillSchema)
        .max(50),
})
    .strict()
    .transform((data) => ({
    specialization: data.specialization,
    licenseNumber: data.licenseNumber,
    yearsOfExperience: data.yearsOfExperience,
    phone: data.phone,
    website: data.website,
    address: data.address,
    bio: data.bio,
    experience: data.experience.map(({ id: _id, ...experience }) => experience),
    skills: data.skills.map(({ id: _id, ...skill }) => skill),
}));
exports.SkillLevelsSchema = zod_1.z.enum(lawyer_model_1.SKILL_LEVELS.map(String));
