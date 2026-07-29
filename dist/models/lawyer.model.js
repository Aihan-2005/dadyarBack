"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LawyerSchema = exports.SkillSchema = exports.WorkExperienceSchema = exports.SKILL_LEVELS = void 0;
const mongoose_1 = require("mongoose");
const env_1 = require("../config/env");
const lawyer_constants_1 = require("../constants/lawyer.constants");
const messages_1 = require("../constants/messages");
exports.SKILL_LEVELS = [
    1,
    2,
    3,
    4,
    5,
];
exports.WorkExperienceSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 150,
    },
    company: {
        type: String,
        required: true,
        trim: true,
        maxlength: 150,
    },
    startYear: {
        type: String,
        required: true,
        trim: true,
        maxlength: 20,
    },
    endYear: {
        type: String,
        required: true,
        trim: true,
        maxlength: 20,
    },
    description: {
        type: String,
        trim: true,
        maxlength: 2000,
    },
});
exports.SkillSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100,
    },
    level: {
        type: Number,
        required: true,
        enum: exports.SKILL_LEVELS,
        min: 1,
        max: 5,
    },
});
exports.LawyerSchema = new mongoose_1.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100,
    },
    lastName: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100,
    },
    email: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true,
        sparse: true,
    },
    phone: {
        type: String,
        match: /^09\d{9}$/,
        unique: true,
        trim: true,
        sparse: true,
    },
    password: {
        type: String,
        required: true,
        select: false,
    },
    role: {
        type: String,
        enum: Object.values(lawyer_constants_1.LAWYER_ROLES),
        default: lawyer_constants_1.DEFAULT_LAWYER_ROLE,
        required: true,
        immutable: true,
        index: true,
    },
    status: {
        type: String,
        enum: Object.values(lawyer_constants_1.LAWYER_STATUSES),
        default: lawyer_constants_1.DEFAULT_LAWYER_STATUS,
        required: true,
        index: true,
    },
    emailVerifiedAt: {
        type: Date,
        default: null,
    },
    phoneVerifiedAt: {
        type: Date,
        default: null,
    },
    licenseVerifiedAt: {
        type: Date,
        default: null,
    },
    lastLoginAt: {
        type: Date,
        default: null,
    },
    specialization: {
        type: String,
        trim: true,
        maxlength: 150,
    },
    licenseNumber: {
        type: String,
        unique: true,
        trim: true,
        sparse: true,
        maxlength: 50,
    },
    yearsOfExperience: {
        type: Number,
        required: true,
        min: 0,
        max: 80,
        default: 0,
    },
    website: {
        type: String,
        trim: true,
        maxlength: 500,
    },
    address: {
        type: String,
        trim: true,
        maxlength: 500,
    },
    bio: {
        type: String,
        trim: true,
        maxlength: 2000,
    },
    experience: {
        type: [
            exports.WorkExperienceSchema,
        ],
        default: [],
    },
    skills: {
        type: [exports.SkillSchema],
        default: [],
    },
}, {
    timestamps: true,
    versionKey: false,
});
exports.LawyerSchema.pre("validate", function () {
    if (!this.email &&
        !this.phone) {
        throw new Error(messages_1.MESSAGES.noEmailNorPhone[env_1.env.LANGUAGE]);
    }
});
const LawyerModel = (0, mongoose_1.model)("Lawyer", exports.LawyerSchema);
exports.default = LawyerModel;
