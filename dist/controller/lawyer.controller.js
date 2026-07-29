"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LawyerController = void 0;
const env_1 = require("../config/env");
const messages_1 = require("../constants/messages");
const httpException_1 = require("../exceptions/httpException");
const lawyer_validator_1 = require("../validators/lawyer.validator");
const LANGUAGE = env_1.env.LANGUAGE;
class LawyerController {
    constructor(lawyerService) {
        this.lawyerService = lawyerService;
        this.me = async (req, res, next) => {
            try {
                const lawyerId = this.getLawyerId(req);
                const lawyer = await this.lawyerService
                    .findById(lawyerId);
                if (!lawyer) {
                    throw new httpException_1.HttpExceptoin(404, messages_1.MESSAGES.noUserWithId[LANGUAGE]);
                }
                return res
                    .status(200)
                    .json({
                    success: true,
                    data: lawyer,
                });
            }
            catch (error) {
                return next(error);
            }
        };
        this.updateProfile = async (req, res, next) => {
            try {
                const lawyerId = this.getLawyerId(req);
                const profile = await lawyer_validator_1.LawyerProfileSchema
                    .parseAsync(req.body ?? {});
                const updated = await this.lawyerService
                    .updateProfile(lawyerId, profile);
                return res
                    .status(200)
                    .json({
                    success: true,
                    data: updated,
                });
            }
            catch (error) {
                return next(error);
            }
        };
    }
    getLawyerId(req) {
        const lawyerId = req.user?.id;
        if (!lawyerId) {
            throw new httpException_1.HttpExceptoin(401, messages_1.MESSAGES.unauthorized[LANGUAGE]);
        }
        return lawyerId;
    }
}
exports.LawyerController = LawyerController;
