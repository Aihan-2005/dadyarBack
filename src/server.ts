import "dotenv/config";

import App from "./app";

import { Database } from "./config/db";

import { env } from "./config/env";

import {
  ClientOnlineContractRoute,
  LawyerOnlineContractRoute,
} from "./routes/onlineContract.route";

import type { Route } from "./interfaces/route.interface";

import AuthRoute from "./routes/auth.route";

import CaseRoute from "./routes/case.route";

import IndexRoute from "./routes/index.route";

import LawyerRoute from "./routes/lawyer.route";

import LawyerClientRoute from "./routes/lawyerClient.route";

import { ClientProfileRoute } from "./routes/clientProfile.route";

import {
  ClientLawyerAvailabilityRoute,
  LawyerAvailabilityRoute,
} from "./routes/lawyerAvailability.route";

import { FinancialReportRoute } from "./routes/financialReport.route";

import { ApiDocsRoute } from "./routes/apiDocs.route";

import NotificationRoute from "./routes/notification.route";

import TicketRoute from "./routes/ticket.route";

import ClientCaseRoute from "./routes/clientCase.route";

import { AdminRoute } from "./routes/admin.route";

import { FAQRoute } from "./routes/faq.route";

import ClientPetitionRoute from "./routes/clientPetition.route";

import {
  ClientLawyerInquiryRoute,
  LawyerClientInquiryRoute,
} from "./routes/clientLawyerInquiry.route";

import {
  ClientConsultationBookingRoute,
  LawyerConsultationBookingRoute,
} from "./routes/consultationBooking.route";

import { SubscriptionPlanRoute } from "./routes/subscriptionPlan.route";
import { LawyerSubscriptionRoute } from "./routes/lawyerSubscription.route";

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
  console.info(`[Server] Starting application in ${env.NODE_ENV} mode...`);

  const database = new Database();

  try {
    await database.connect();

    console.info("[Server] Database connection established.");

    const routes: Route[] = [
      new IndexRoute(),

      new AuthRoute(),

      new LawyerRoute(),

      new LawyerAvailabilityRoute(),

      new ClientProfileRoute(),

      new LawyerClientRoute(),

      new CaseRoute(),

      new FinancialReportRoute(),

      new NotificationRoute(),

      new TicketRoute(),

      new ClientCaseRoute(),

      new ClientPetitionRoute(),

      new ClientLawyerInquiryRoute(),

      new ClientLawyerAvailabilityRoute(),

      new ClientConsultationBookingRoute(),
      new ClientOnlineContractRoute(),

      new LawyerClientInquiryRoute(),

      new LawyerConsultationBookingRoute(),

      new LawyerOnlineContractRoute(),

      new AdminRoute(),

      new FAQRoute(),

      new ApiDocsRoute(),

      new SubscriptionPlanRoute(),

      new LawyerSubscriptionRoute(),
    ];

    const app = new App(routes);

    app.listen();

    console.info(
      `[Server] Application started successfully on port ${env.PORT}.`,
    );
  } catch (error: unknown) {
    const normalizedError = normalizeError(error);

    console.error("[Server] Application startup failed:", normalizedError);

    process.exitCode = 1;
  }
}

process.on(
  "unhandledRejection",

  (reason: unknown) => {
    const error = normalizeError(reason);

    console.error("[Process] Unhandled promise rejection:", error);

    process.exit(1);
  },
);

process.on(
  "uncaughtException",

  (error: Error) => {
    console.error("[Process] Uncaught exception:", error);

    process.exit(1);
  },
);

process.once(
  "SIGINT",

  () => {
    void shutdown("SIGINT");
  },
);

process.once(
  "SIGTERM",

  () => {
    void shutdown("SIGTERM");
  },
);

void bootstrap().catch((error: unknown) => {
  const normalizedError = normalizeError(error);

  console.error("[Server] Unexpected bootstrap error:", normalizedError);

  process.exit(1);
});
