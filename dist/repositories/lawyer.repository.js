"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LawyerRepository = void 0;
const lawyer_constants_1 = require("../constants/lawyer.constants");
const lawyer_model_1 = __importDefault(require("../models/lawyer.model"));
const base_repository_1 = require("./base.repository");
class LawyerRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(lawyer_model_1.default);
    }
    findByEmail(email) {
        return this.model
            .findOne({ email })
            .lean()
            .exec();
    }
    findByPhone(phone) {
        return this.model
            .findOne({ phone })
            .lean()
            .exec();
    }
    findByLicenseNumber(licenseNumber) {
        return this.model
            .findOne({
            licenseNumber,
        })
            .lean()
            .exec();
    }
    findById(id) {
        return this.model
            .findById(this.toObjectId(id))
            .lean()
            .exec();
    }
    findAccessContextById(id) {
        return this.model
            .findById(this.toObjectId(id))
            .select("_id role status")
            .lean()
            .exec();
    }
    findAuthByEmail(email) {
        return this.model
            .findOne({ email })
            .select("+password")
            .lean()
            .exec();
    }
    findAuthByPhone(phone) {
        return this.model
            .findOne({ phone })
            .select("+password")
            .lean()
            .exec();
    }
    create(data) {
        return this.model.create({
            ...data,
            role: lawyer_constants_1.DEFAULT_LAWYER_ROLE,
            status: lawyer_constants_1.DEFAULT_LAWYER_STATUS,
            emailVerifiedAt: null,
            phoneVerifiedAt: null,
            licenseVerifiedAt: null,
            lastLoginAt: null,
            specialization: "",
            yearsOfExperience: 0,
            address: "",
            bio: "",
            experience: [],
            skills: [],
        });
    }
    updateLastLogin(id, lastLoginAt) {
        return this.model
            .updateOne({
            _id: this.toObjectId(id),
        }, {
            $set: {
                lastLoginAt,
            },
        })
            .exec();
    }
    updateProfileById(id, update) {
        return this.model
            .findByIdAndUpdate(this.toObjectId(id), update, {
            new: true,
            runValidators: true,
        })
            .lean()
            .exec();
    }
}
exports.LawyerRepository = LawyerRepository;
