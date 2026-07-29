"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListCasesQuerySchema = exports.ParamCaseAndRelatedPersonIdSchema = exports.ParamCaseAndOpposingLawyerIdSchema = exports.ParamCaseAndAssistantLawyerIdSchema = exports.ParamCaseAndOpposingPartyIdSchema = exports.ParamCaseAndClientIdSchema = exports.ParamSubDocumentIdSchema = exports.ParamCaseIdSchema = exports.UpdateRelatedPersonSchema = exports.AddRelatedPersonSchema = exports.UpdateOpposingLawyerSchema = exports.AddOpposingLawyerSchema = exports.UpdateAssistantLawyerSchema = exports.AddAssistantLawyerSchema = exports.UpdateOpposingPartySchema = exports.AddOpposingPartySchema = exports.UpdateClientSchema = exports.AddClientSchema = exports.UpdateCaseStateSchema = exports.UpdateCaseSchema = exports.CreateCaseSchema = exports.RelatedPersonSchema = exports.LawyerContactSchema = exports.OpposingPartySchema = exports.ClientSchema = exports.CourtSchema = exports.CourtTypeSchema = exports.CaseStateSchema = exports.MongoIdSchema = void 0;
const zod_1 = require("zod");
const case_constants_1 = require("../constants/case.constants");
const mongoose_1 = require("mongoose");
const messages_1 = require("../constants/messages");
const env_1 = require("../config/env");
const LANGUAGE = env_1.env.LANGUAGE;
exports.MongoIdSchema = zod_1.z
    .string()
    .trim()
    .refine((value) => mongoose_1.Types.ObjectId.isValid(value), {
    message: messages_1.MESSAGES["invalidObjectId"][LANGUAGE],
});
const RequiredString = zod_1.z.string().trim().min(1);
const OptionalString = zod_1.z.string().trim().optional();
exports.CaseStateSchema = zod_1.z.enum(case_constants_1.CASE_SATATE);
exports.CourtTypeSchema = zod_1.z.enum(case_constants_1.COURT_TYPES);
exports.CourtSchema = zod_1.z.object({
    type: exports.CourtTypeSchema,
    province: RequiredString,
    city: RequiredString,
    branch: RequiredString,
    branchCode: OptionalString,
});
exports.ClientSchema = zod_1.z.object({
    fullName: RequiredString,
    phone: RequiredString,
    nationalId: OptionalString,
    role: OptionalString,
});
exports.OpposingPartySchema = zod_1.z.object({
    fullName: RequiredString,
    phone: OptionalString,
    nationalId: OptionalString,
    description: OptionalString,
});
exports.LawyerContactSchema = zod_1.z.object({
    fullName: RequiredString,
    phone: RequiredString,
    barLicenseNumber: OptionalString,
    // will turn the string given to date object
    licenseExpiresAt: zod_1.z.coerce.date().optional(),
    licensePlaceOfIssue: OptionalString,
});
exports.RelatedPersonSchema = zod_1.z.object({
    fullName: RequiredString,
    phone: RequiredString,
    description: OptionalString,
});
exports.CreateCaseSchema = zod_1.z.object({
    title: RequiredString,
    caseNumber: RequiredString,
    state: exports.CaseStateSchema.optional(),
    court: exports.CourtSchema,
    clients: zod_1.z.array(exports.ClientSchema).min(1, {
        message: messages_1.MESSAGES["caseNeedClient"][LANGUAGE],
    }),
    opposingParties: zod_1.z.array(exports.OpposingPartySchema).optional(),
    assistantLawyers: zod_1.z.array(exports.LawyerContactSchema).optional(),
    opposingLawyers: zod_1.z.array(exports.LawyerContactSchema).optional(),
    relatedPeople: zod_1.z.array(exports.RelatedPersonSchema).optional(),
});
exports.UpdateCaseSchema = exports.CreateCaseSchema.partial();
exports.UpdateCaseStateSchema = zod_1.z.object({
    state: exports.CaseStateSchema,
});
exports.AddClientSchema = exports.ClientSchema;
exports.UpdateClientSchema = exports.ClientSchema.partial();
exports.AddOpposingPartySchema = exports.OpposingPartySchema;
exports.UpdateOpposingPartySchema = exports.OpposingPartySchema.partial();
exports.AddAssistantLawyerSchema = exports.LawyerContactSchema;
exports.UpdateAssistantLawyerSchema = exports.LawyerContactSchema.partial();
exports.AddOpposingLawyerSchema = exports.LawyerContactSchema;
exports.UpdateOpposingLawyerSchema = exports.LawyerContactSchema.partial();
exports.AddRelatedPersonSchema = exports.RelatedPersonSchema;
exports.UpdateRelatedPersonSchema = exports.RelatedPersonSchema.partial();
exports.ParamCaseIdSchema = zod_1.z.object({
    caseId: exports.MongoIdSchema,
});
exports.ParamSubDocumentIdSchema = zod_1.z.object({
    id: exports.MongoIdSchema,
});
exports.ParamCaseAndClientIdSchema = zod_1.z.object({
    caseId: exports.MongoIdSchema,
    clientId: exports.MongoIdSchema,
});
exports.ParamCaseAndOpposingPartyIdSchema = zod_1.z.object({
    caseId: exports.MongoIdSchema,
    opposingPartyId: exports.MongoIdSchema,
});
exports.ParamCaseAndAssistantLawyerIdSchema = zod_1.z.object({
    caseId: exports.MongoIdSchema,
    assistantLawyerId: exports.MongoIdSchema,
});
exports.ParamCaseAndOpposingLawyerIdSchema = zod_1.z.object({
    caseId: exports.MongoIdSchema,
    opposingLawyerId: exports.MongoIdSchema,
});
exports.ParamCaseAndRelatedPersonIdSchema = zod_1.z.object({
    caseId: exports.MongoIdSchema,
    relatedPersonId: exports.MongoIdSchema,
});
exports.ListCasesQuerySchema = zod_1.z.object({
    state: exports.CaseStateSchema.optional(),
    search: zod_1.z.string().trim().optional(),
    page: zod_1.z.coerce.number().int().min(1).default(1),
    limit: zod_1.z.coerce.number().int().min(1).max(100).default(10),
});
