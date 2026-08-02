import "dotenv/config";

import App from "./app";
import { Database } from "./config/db";

import AuthRoute from "./routes/auth.route";
import CaseRoute from "./routes/case.route";
import IndexRoute from "./routes/index.route";
import LawyerRoute from "./routes/lawyer.route";
import ClientRoute from "./routes/client.route";

let isShuttingDown = false;

function normalizeError(error: unknown): Error {
  if (error instanceof Error) {
    return error;
  }

  if (typeof error === "string") {
    return new Error(error);
  }

  try {
    return new Error(JSON.stringify(error));
  } catch {
    return new Error("Unknown application error");
  }
}

async function shutdown(signal: NodeJS.Signals): Promise<void> {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;

  console.info(`[Server] ${signal} received. Shutting down...`);

  try {
    await new Promise<void>((resolve) => {
      setImmediate(resolve);
    });

    console.info("[Server] Shutdown completed successfully.");

    process.exit(0);
  } catch (error: unknown) {
    const normalizedError = normalizeError(error);

    console.error("[Server] Graceful shutdown failed:", normalizedError);

    process.exit(1);
  }
}

async function bootstrap(): Promise<void> {
  console.info(
    `[Server] Starting application in ${
      process.env.NODE_ENV ?? "development"
    } mode...`,
  );

  const database = new Database();

  try {
    await database.connect();

    console.info("[Server] Database connection established.");

    const routes = [
      new IndexRoute(),
      new LawyerRoute(),
      new AuthRoute(),
      new CaseRoute(),
      new ClientRoute(),
    ];

    const app = new App(routes);

    app.listen();

    console.info(
      `[Server] Application started successfully on port ${
        process.env.PORT ?? "5000"
      }.`,
    );
  } catch (error: unknown) {
    const normalizedError = normalizeError(error);

    console.error("[Server] Application startup failed:", normalizedError);

    process.exitCode = 1;
  }
}

process.on("unhandledRejection", (reason: unknown) => {
  const error = normalizeError(reason);

  console.error("[Process] Unhandled promise rejection:", error);

  process.exit(1);
});

/**
 * خطاهای synchronous که هیچ‌جا مدیریت نشده‌اند.
 */
process.on("uncaughtException", (error: Error) => {
  console.error("[Process] Uncaught exception:", error);

  process.exit(1);
});

process.once("SIGINT", () => {
  void shutdown("SIGINT");
});

process.once("SIGTERM", () => {
  void shutdown("SIGTERM");
});

void bootstrap().catch((error: unknown) => {
  const normalizedError = normalizeError(error);

  console.error("[Server] Unexpected bootstrap error:", normalizedError);

  process.exit(1);
});
