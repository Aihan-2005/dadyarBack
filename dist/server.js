"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const app_1 = __importDefault(require("./app"));
const db_1 = require("./config/db");
const auth_route_1 = __importDefault(require("./routes/auth.route"));
const index_route_1 = __importDefault(require("./routes/index.route"));
const lawyer_route_1 = __importDefault(require("./routes/lawyer.route"));
let isShuttingDown = false;
function normalizeError(error) {
    if (error instanceof Error) {
        return error;
    }
    if (typeof error === "string") {
        return new Error(error);
    }
    try {
        return new Error(JSON.stringify(error));
    }
    catch {
        return new Error("Unknown application error");
    }
}
async function shutdown(signal) {
    if (isShuttingDown) {
        return;
    }
    isShuttingDown = true;
    console.info(`[Server] ${signal} received. Shutting down...`);
    try {
        await new Promise((resolve) => {
            setImmediate(resolve);
        });
        console.info("[Server] Shutdown completed successfully.");
        process.exit(0);
    }
    catch (error) {
        const normalizedError = normalizeError(error);
        console.error("[Server] Graceful shutdown failed:", normalizedError);
        process.exit(1);
    }
}
async function bootstrap() {
    console.info(`[Server] Starting application in ${process.env.NODE_ENV ?? "development"} mode...`);
    const database = new db_1.Database();
    try {
        await database.connect();
        console.info("[Server] Database connection established.");
        const routes = [
            new index_route_1.default(),
            new lawyer_route_1.default(),
            new auth_route_1.default(),
        ];
        const app = new app_1.default(routes);
        app.listen();
        console.info(`[Server] Application started successfully on port ${process.env.PORT ?? "5000"}.`);
    }
    catch (error) {
        const normalizedError = normalizeError(error);
        console.error("[Server] Application startup failed:", normalizedError);
        process.exitCode = 1;
    }
}
process.on("unhandledRejection", (reason) => {
    const error = normalizeError(reason);
    console.error("[Process] Unhandled promise rejection:", error);
    process.exit(1);
});
/**
 * خطاهای synchronous که هیچ‌جا مدیریت نشده‌اند.
 */
process.on("uncaughtException", (error) => {
    console.error("[Process] Uncaught exception:", error);
    process.exit(1);
});
process.once("SIGINT", () => {
    void shutdown("SIGINT");
});
process.once("SIGTERM", () => {
    void shutdown("SIGTERM");
});
void bootstrap().catch((error) => {
    const normalizedError = normalizeError(error);
    console.error("[Server] Unexpected bootstrap error:", normalizedError);
    process.exit(1);
});
