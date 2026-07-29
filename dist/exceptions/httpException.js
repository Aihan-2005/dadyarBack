"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpExceptoin = void 0;
class HttpExceptoin extends Error {
    constructor(status, message, code = "HTTP_ERRPR", details) {
        super(message);
        this.status = status;
        this.code = code;
        this.details = details;
        this.name =
            'HttpExceptoin';
        Object.setPrototypeOf(this, HttpExceptoin.prototype);
    }
}
exports.HttpExceptoin = HttpExceptoin;
