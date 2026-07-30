"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginSchema = exports.SignupSchema = void 0;
const node_buffer_1 = require("node:buffer");
const zod_1 = require("zod");
const env_1 = require("../config/env");
const messages_1 = require("../constants/messages");
const LANGUAGE = env_1.env.LANGUAGE;
function normalizeDigits(value) {
    const persianDigits = "۰۱۲۳۴۵۶۷۸۹";
    const arabicDigits = "٠١٢٣٤٥٦٧٨٩";
    return value
        .replace(/[۰-۹]/g, (character) => String(persianDigits.indexOf(character)))
        .replace(/[٠-٩]/g, (character) => String(arabicDigits.indexOf(character)));
}
const RequiredNameSchema = zod_1.z
    .string()
    .trim()
    .min(1)
    .max(100);
const EmailSchema = zod_1.z
    .string()
    .trim()
    .toLowerCase()
    .email();
const PhoneSchema = zod_1.z.preprocess((value) => {
    if (typeof value === "string") {
        return normalizeDigits(value.trim());
    }
    return value;
}, zod_1.z
    .string()
    .regex(/^09\d{9}$/));
const PasswordSchema = zod_1.z
    .string()
    .min(8, "رمز عبور باید حداقل ۸ کاراکتر باشد")
    .refine((value) => node_buffer_1.Buffer.byteLength(value, "utf8") <= 72, {
    message: messages_1.MESSAGES.passwordTooLong[LANGUAGE],
});
const LoginPasswordSchema = zod_1.z
    .string()
    .min(1)
    .refine((value) => node_buffer_1.Buffer.byteLength(value, "utf8") <= 72, {
    message: messages_1.MESSAGES.passwordTooLong[LANGUAGE],
});
exports.SignupSchema = zod_1.z
    .object({
    firstName: RequiredNameSchema,
    lastName: RequiredNameSchema,
    email: EmailSchema.optional(),
    phone: PhoneSchema.optional(),
    password: PasswordSchema,
})
    .strict()
    .superRefine((data, context) => {
    if (!data.email &&
        !data.phone) {
        context.addIssue({
            code: zod_1.z.ZodIssueCode.custom,
            path: ["email"],
            message: messages_1.MESSAGES
                .noEmailNorPhone[LANGUAGE],
        });
    }
});
exports.LoginSchema = zod_1.z
    .object({
    email: EmailSchema.optional(),
    phone: PhoneSchema.optional(),
    password: LoginPasswordSchema,
})
    .strict()
    .superRefine((data, context) => {
    const identifierCount = Number(Boolean(data.email)) +
        Number(Boolean(data.phone));
    if (identifierCount !== 1) {
        context.addIssue({
            code: zod_1.z.ZodIssueCode.custom,
            path: ["email"],
            message: "دقیقاً یکی از ایمیل یا شماره همراه باید ارسال شود",
        });
    }
});
