"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseRepository = void 0;
const mongoose_1 = require("mongoose");
const messages_1 = require("../constants/messages");
const env_1 = require("../config/env");
const LANGUAGE = env_1.env.LANGUAGE;
class BaseRepository {
    constructor(model) {
        this.model = model;
    }
    ;
    toObjectId(id) {
        if (!mongoose_1.Types.ObjectId.isValid(id))
            throw new Error(messages_1.MESSAGES.notValidId[LANGUAGE]);
        return (new mongoose_1.Types.ObjectId(id));
    }
}
exports.BaseRepository = BaseRepository;
