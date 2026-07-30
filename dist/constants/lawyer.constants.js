"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_LAWYER_STATUS = exports.DEFAULT_LAWYER_ROLE = exports.LAWYER_STATUSES = exports.LAWYER_ROLES = void 0;
exports.isLawyerRole = isLawyerRole;
exports.isLawyerStatus = isLawyerStatus;
exports.resolveLawyerRole = resolveLawyerRole;
exports.resolveLawyerStatus = resolveLawyerStatus;
exports.isActiveLawyerStatus = isActiveLawyerStatus;
exports.LAWYER_ROLES = {
    LAWYER: "LAWYER",
};
exports.LAWYER_STATUSES = {
    PENDING_VERIFICATION: "PENDING_VERIFICATION",
    ACTIVE: "ACTIVE",
    SUSPENDED: "SUSPENDED",
    REJECTED: "REJECTED",
};
exports.DEFAULT_LAWYER_ROLE = exports.LAWYER_ROLES.LAWYER;
exports.DEFAULT_LAWYER_STATUS = exports.LAWYER_STATUSES.PENDING_VERIFICATION;
const LAWYER_ROLE_VALUES = new Set(Object.values(exports.LAWYER_ROLES));
const LAWYER_STATUS_VALUES = new Set(Object.values(exports.LAWYER_STATUSES));
function isLawyerRole(value) {
    return (typeof value === "string" &&
        LAWYER_ROLE_VALUES.has(value));
}
function isLawyerStatus(value) {
    return (typeof value === "string" &&
        LAWYER_STATUS_VALUES.has(value));
}
function resolveLawyerRole(value) {
    return isLawyerRole(value)
        ? value
        : exports.DEFAULT_LAWYER_ROLE;
}
function resolveLawyerStatus(value) {
    return isLawyerStatus(value)
        ? value
        : exports.DEFAULT_LAWYER_STATUS;
}
function isActiveLawyerStatus(status) {
    return status === exports.LAWYER_STATUSES.ACTIVE;
}
