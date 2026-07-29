"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toPublicLawyerDTO = toPublicLawyerDTO;
const mongoose_1 = require("mongoose");
const lawyer_constants_1 = require("../constants/lawyer.constants");
function toId(value) {
    if (value instanceof
        mongoose_1.Types.ObjectId) {
        return value.toHexString();
    }
    if (typeof value === "string" &&
        value.length > 0) {
        return value;
    }
    throw new Error("Invalid MongoDB identifier");
}
function toISODate(value) {
    if (value instanceof Date) {
        return value.toISOString();
    }
    if (typeof value === "string") {
        const date = new Date(value);
        if (!Number.isNaN(date.getTime())) {
            return date.toISOString();
        }
    }
    return null;
}
function mapExperience(item) {
    return {
        id: toId(item._id),
        title: item.title,
        company: item.company,
        startYear: item.startYear,
        endYear: item.endYear,
        description: item.description ?? "",
    };
}
function mapSkill(item) {
    return {
        id: toId(item._id),
        name: item.name,
        level: item.level,
    };
}
function toPublicLawyerDTO(lawyer) {
    const emailVerifiedAt = toISODate(lawyer.emailVerifiedAt);
    const phoneVerifiedAt = toISODate(lawyer.phoneVerifiedAt);
    const licenseVerifiedAt = toISODate(lawyer.licenseVerifiedAt);
    return {
        id: toId(lawyer._id),
        firstName: lawyer.firstName,
        lastName: lawyer.lastName,
        email: lawyer.email ?? null,
        role: (0, lawyer_constants_1.resolveLawyerRole)(lawyer.role),
        status: (0, lawyer_constants_1.resolveLawyerStatus)(lawyer.status),
        verification: {
            email: {
                verified: emailVerifiedAt !==
                    null,
                verifiedAt: emailVerifiedAt,
            },
            phone: {
                verified: phoneVerifiedAt !==
                    null,
                verifiedAt: phoneVerifiedAt,
            },
            license: {
                verified: licenseVerifiedAt !==
                    null,
                verifiedAt: licenseVerifiedAt,
            },
        },
        profile: {
            specialization: lawyer.specialization ??
                "",
            licenseNumber: lawyer.licenseNumber ??
                "",
            yearsOfExperience: String(lawyer.yearsOfExperience ??
                0),
            phone: lawyer.phone ?? "",
            website: lawyer.website ?? "",
            address: lawyer.address ?? "",
            bio: lawyer.bio ?? "",
            experience: (lawyer.experience ??
                []).map(mapExperience),
            skills: (lawyer.skills ??
                []).map(mapSkill),
        },
        lastLoginAt: toISODate(lawyer.lastLoginAt),
        createdAt: toISODate(lawyer.createdAt),
        updatedAt: toISODate(lawyer.updatedAt),
    };
}
