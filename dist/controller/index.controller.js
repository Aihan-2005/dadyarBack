"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class IndexController {
    constructor() {
        this.index = (_req, res, _next) => {
            res.json({ success: true, message: "Yo" });
        };
    }
}
exports.default = IndexController;
