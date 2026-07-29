"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Database = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const env_1 = require("./env");
class Database {
    constructor() {
        this.url = env_1.env.MONGO_URI;
    }
    async connect() {
        await mongoose_1.default.connect(this.url);
        console.log("MongoDB connected successfully");
    }
    async disconnect() {
        await mongoose_1.default.disconnect();
        console.log("MongoDB disconnected successfully");
    }
}
exports.Database = Database;
