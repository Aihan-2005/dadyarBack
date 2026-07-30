"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpException = void 0;
class HttpException extends Error {
  constructor(status, message, code = "HTTP_ERRPR", details) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
    this.name = "HttpException";
    Object.setPrototypeOf(this, HttpException.prototype);
  }
}
exports.HttpException = HttpException;
