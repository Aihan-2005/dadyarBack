"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CaseRepository = void 0;
const case_model_1 = require("../models/case.model");
const base_repository_1 = require("./base.repository");
// NOTE: all public methods return promises
class CaseRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(case_model_1.CaseModel);
    }
    // Helper Methods
    buildSubDocumentSet(path, data) {
        const updateData = {};
        for (const [key, value] of Object.entries(data)) {
            if (value !== undefined) {
                updateData[`${path}.$.${key}`] = value;
            }
        }
        return updateData;
    }
    buildNestedSet(path, data) {
        const updateData = {};
        for (const [key, value] of Object.entries(data)) {
            if (value !== undefined) {
                updateData[`${path}.${key}`] = value;
            }
        }
        return updateData;
    }
    // Finding Methods
    findById(id) {
        return this.model.findById(this.toObjectId(id)).lean().exec();
    }
    findByIdForLawyer(lawyerId, caseId) {
        return this.model
            .findOne({
            _id: this.toObjectId(caseId),
            lawyerId: this.toObjectId(lawyerId),
        })
            .lean()
            .exec();
    }
    findByCaseNumber(lawyerId, caseNumber) {
        return this.model
            .findOne({
            lawyerId: this.toObjectId(lawyerId),
            caseNumber,
        })
            .lean()
            .exec();
    }
    findByLawyerId(lawyerId, options = {}) {
        const page = options.page ?? 1;
        const limit = options.limit ?? 10;
        const skip = (page - 1) * limit;
        const query = {
            lawyerId: this.toObjectId(lawyerId),
        };
        if (options.state) {
            query.state = options.state;
        }
        if (options.search) {
            query.$or = [
                { title: { $regex: options.search, $options: "i" } },
                { caseNumber: { $regex: options.search, $options: "i" } },
                { "court.province": { $regex: options.search, $options: "i" } },
                { "court.city": { $regex: options.search, $options: "i" } },
                { "clients.fullName": { $regex: options.search, $options: "i" } },
                {
                    "opposingParties.fullName": { $regex: options.search, $options: "i" },
                },
            ];
        }
        return this.model
            .find(query)
            .sort({ updatedAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean()
            .exec();
    }
    countByLawyerId(lawyerId, options = {}) {
        const query = {
            lawyerId: this.toObjectId(lawyerId),
        };
        if (options.state) {
            query.state = options.state;
        }
        if (options.search) {
            query.$or = [
                { title: { $regex: options.search, $options: "i" } },
                { caseNumber: { $regex: options.search, $options: "i" } },
                { "court.province": { $regex: options.search, $options: "i" } },
                { "court.city": { $regex: options.search, $options: "i" } },
                { "clients.fullName": { $regex: options.search, $options: "i" } },
                {
                    "opposingParties.fullName": { $regex: options.search, $options: "i" },
                },
            ];
        }
        return this.model.countDocuments(query).exec();
    }
    // Create And Updating Methods
    create(data) {
        return this.model.create(data);
    }
    updateByIdForLawyer(lawyerId, caseId, data) {
        return this.model
            .findOneAndUpdate({
            _id: this.toObjectId(caseId),
            lawyerId: this.toObjectId(lawyerId),
        }, data, {
            new: true,
            runValidators: true,
        })
            .lean()
            .exec();
    }
    updateState(lawyerId, caseId, state) {
        return this.model
            .findOneAndUpdate({
            _id: this.toObjectId(caseId),
            lawyerId: this.toObjectId(lawyerId),
        }, { $set: { state } }, {
            new: true,
            runValidators: true,
        })
            .lean()
            .exec();
    }
    updateCourt(lawyerId, caseId, court) {
        return this.model
            .findOneAndUpdate({
            _id: this.toObjectId(caseId),
            lawyerId: this.toObjectId(lawyerId),
        }, {
            $set: this.buildNestedSet("court", court),
        }, {
            new: true,
            runValidators: true,
        })
            .lean()
            .exec();
    }
    // Client Methods
    addClient(lawyerId, caseId, client) {
        return this.model
            .findOneAndUpdate({
            _id: this.toObjectId(caseId),
            lawyerId: this.toObjectId(lawyerId),
        }, { $push: { clients: client } }, {
            new: true,
            runValidators: true,
        })
            .lean()
            .exec();
    }
    updateClient(lawyerId, caseId, clientId, client) {
        return this.model
            .updateOne({
            _id: this.toObjectId(caseId),
            lawyerId: this.toObjectId(lawyerId),
            "clients._id": this.toObjectId(clientId),
        }, {
            $set: this.buildSubDocumentSet("clients", client),
        }, {
            runValidators: true,
        })
            .exec();
    }
    removeClient(lawyerId, caseId, clientId) {
        return this.model
            .updateOne({
            _id: this.toObjectId(caseId),
            lawyerId: this.toObjectId(lawyerId),
        }, {
            $pull: {
                clients: { _id: this.toObjectId(clientId) },
            },
        })
            .exec();
    }
    // Opposing Party Methods
    addOpposingParty(lawyerId, caseId, opposingParty) {
        return this.model
            .findOneAndUpdate({
            _id: this.toObjectId(caseId),
            lawyerId: this.toObjectId(lawyerId),
        }, { $push: { opposingParties: opposingParty } }, {
            new: true,
            runValidators: true,
        })
            .lean()
            .exec();
    }
    updateOpposingParty(lawyerId, caseId, opposingPartyId, opposingParty) {
        return this.model
            .updateOne({
            _id: this.toObjectId(caseId),
            lawyerId: this.toObjectId(lawyerId),
            "opposingParties._id": this.toObjectId(opposingPartyId),
        }, {
            $set: this.buildSubDocumentSet("opposingParties", opposingParty),
        }, {
            runValidators: true,
        })
            .exec();
    }
    removeOpposingParty(lawyerId, caseId, opposingPartyId) {
        return this.model
            .updateOne({
            _id: this.toObjectId(caseId),
            lawyerId: this.toObjectId(lawyerId),
        }, {
            $pull: {
                opposingParties: { _id: this.toObjectId(opposingPartyId) },
            },
        })
            .exec();
    }
    // Assistant Lawyer Methods
    addAssistantLawyer(lawyerId, caseId, assistantLawyer) {
        return this.model
            .findOneAndUpdate({
            _id: this.toObjectId(caseId),
            lawyerId: this.toObjectId(lawyerId),
        }, { $push: { assistantLawyers: assistantLawyer } }, {
            new: true,
            runValidators: true,
        })
            .lean()
            .exec();
    }
    updateAssistantLawyer(lawyerId, caseId, assistantLawyerId, assistantLawyer) {
        return this.model
            .updateOne({
            _id: this.toObjectId(caseId),
            lawyerId: this.toObjectId(lawyerId),
            "assistantLawyers._id": this.toObjectId(assistantLawyerId),
        }, {
            $set: this.buildSubDocumentSet("assistantLawyers", assistantLawyer),
        }, {
            runValidators: true,
        })
            .exec();
    }
    removeAssistantLawyer(lawyerId, caseId, assistantLawyerId) {
        return this.model
            .updateOne({
            _id: this.toObjectId(caseId),
            lawyerId: this.toObjectId(lawyerId),
        }, {
            $pull: {
                assistantLawyers: { _id: this.toObjectId(assistantLawyerId) },
            },
        })
            .exec();
    }
    // Opposing Lawyer Methods
    addOpposingLawyer(lawyerId, caseId, opposingLawyer) {
        return this.model
            .findOneAndUpdate({
            _id: this.toObjectId(caseId),
            lawyerId: this.toObjectId(lawyerId),
        }, { $push: { opposingLawyers: opposingLawyer } }, {
            new: true,
            runValidators: true,
        })
            .lean()
            .exec();
    }
    updateOpposingLawyer(lawyerId, caseId, opposingLawyerId, opposingLawyer) {
        return this.model
            .updateOne({
            _id: this.toObjectId(caseId),
            lawyerId: this.toObjectId(lawyerId),
            "opposingLawyers._id": this.toObjectId(opposingLawyerId),
        }, {
            $set: this.buildSubDocumentSet("opposingLawyers", opposingLawyer),
        }, {
            runValidators: true,
        })
            .exec();
    }
    removeOpposingLawyer(lawyerId, caseId, opposingLawyerId) {
        return this.model
            .updateOne({
            _id: this.toObjectId(caseId),
            lawyerId: this.toObjectId(lawyerId),
        }, {
            $pull: {
                opposingLawyers: { _id: this.toObjectId(opposingLawyerId) },
            },
        })
            .exec();
    }
    // Related People Methods
    addRelatedPerson(lawyerId, caseId, relatedPerson) {
        return this.model
            .findOneAndUpdate({
            _id: this.toObjectId(caseId),
            lawyerId: this.toObjectId(lawyerId),
        }, { $push: { relatedPeople: relatedPerson } }, {
            new: true,
            runValidators: true,
        })
            .lean()
            .exec();
    }
    updateRelatedPerson(lawyerId, caseId, relatedPersonId, relatedPerson) {
        return this.model
            .updateOne({
            _id: this.toObjectId(caseId),
            lawyerId: this.toObjectId(lawyerId),
            "relatedPeople._id": this.toObjectId(relatedPersonId),
        }, {
            $set: this.buildSubDocumentSet("relatedPeople", relatedPerson),
        }, {
            runValidators: true,
        })
            .exec();
    }
    removeRelatedPerson(lawyerId, caseId, relatedPersonId) {
        return this.model
            .updateOne({
            _id: this.toObjectId(caseId),
            lawyerId: this.toObjectId(lawyerId),
        }, {
            $pull: {
                relatedPeople: { _id: this.toObjectId(relatedPersonId) },
            },
        })
            .exec();
    }
}
exports.CaseRepository = CaseRepository;
