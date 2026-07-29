"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CaseModel = exports.CaseSchema = void 0;
const mongoose_1 = require("mongoose");
const case_constants_1 = require("../constants/case.constants");
const CourtSchema = new mongoose_1.Schema({
    type: {
        type: String,
        enum: case_constants_1.COURT_TYPES,
        required: true,
    },
    province: {
        type: String,
        required: true,
        trim: true,
    },
    city: {
        type: String,
        required: true,
        trim: true,
    },
    branch: {
        type: String,
        required: true,
        trim: true,
    },
    branchCode: {
        type: String,
        trim: true,
    },
}, { _id: false });
const ClientSchema = new mongoose_1.Schema({
    fullName: {
        type: String,
        required: true,
        trim: true,
    },
    phone: {
        type: String,
        required: true,
        trim: true,
    },
    nationalId: {
        type: String,
        trim: true,
    },
    role: {
        type: String,
        trim: true,
    },
}, { _id: true });
const OpposingPartySchema = new mongoose_1.Schema({
    fullName: {
        type: String,
        required: true,
        trim: true,
    },
    phone: {
        type: String,
        trim: true,
    },
    nationalId: {
        type: String,
        trim: true,
    },
    description: {
        type: String,
        trim: true,
    },
}, { _id: true });
const LawyerContactSchema = new mongoose_1.Schema({
    fullName: {
        type: String,
        required: true,
        trim: true,
    },
    phone: {
        type: String,
        required: true,
        trim: true,
    },
    barLicenseNumber: {
        type: String,
        trim: true,
    },
    licenseExpiresAt: {
        type: Date,
    },
    licensePlaceOfIssue: {
        type: String,
        trim: true,
    },
}, { _id: true });
const RelatedPersonSchema = new mongoose_1.Schema({
    fullName: {
        type: String,
        required: true,
        trim: true,
    },
    phone: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        trim: true,
    },
}, { _id: true });
exports.CaseSchema = new mongoose_1.Schema({
    lawyerId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Lawyer",
        required: true,
        index: true,
    },
    title: {
        type: String,
        required: true,
        trim: true,
    },
    caseNumber: {
        type: String,
        required: true,
        trim: true,
    },
    state: {
        type: String,
        enum: case_constants_1.CASE_SATATE,
        default: "PENDING",
        index: true,
    },
    court: {
        type: CourtSchema,
        required: true,
    },
    clients: {
        type: [ClientSchema],
        required: true,
        default: [],
    },
    opposingParties: {
        type: [OpposingPartySchema],
        default: [],
    },
    assistantLawyers: {
        type: [LawyerContactSchema],
        default: [],
    },
    opposingLawyers: {
        type: [LawyerContactSchema],
        default: [],
    },
    relatedPeople: {
        type: [RelatedPersonSchema],
        default: [],
    },
}, { timestamps: true });
exports.CaseSchema.index({ lawyerId: 1, caseNumber: 1 }, { unique: true });
exports.CaseSchema.index({ lawyerId: 1, state: 1, updatedAt: -1 });
exports.CaseModel = (0, mongoose_1.model)("Case", exports.CaseSchema);
