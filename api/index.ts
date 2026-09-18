import App from "../src/app";

import { Database } from "../src/config/db";

import type { Route } from "../src/interfaces/route.interface";

import IndexRoute from "../src/routes/index.route";

import AuthRoute from "../src/routes/auth.route";

import LawyerRoute from "../src/routes/lawyer.route";

import CaseRoute from "../src/routes/case.route";

import LawyerClientRoute from "../src/routes/lawyerClient.route";

import { ClientProfileRoute } from "../src/routes/clientProfile.route";

import {
  ClientLawyerAvailabilityRoute,
  LawyerAvailabilityRoute,
} from "../src/routes/lawyerAvailability.route";

import { FinancialReportRoute } from "../src/routes/financialReport.route";

import { ApiDocsRoute } from "../src/routes/apiDocs.route";

import NotificationRoute from "../src/routes/notification.route";

import TicketRoute from "../src/routes/ticket.route";

import ClientCaseRoute from "../src/routes/clientCase.route";

import { AdminRoute } from "../src/routes/admin.route";

import { FAQRoute } from "../src/routes/faq.route";

import ClientPetitionRoute from "../src/routes/clientPetition.route";

import {
  ClientLawyerInquiryRoute,
  LawyerClientInquiryRoute,
} from "../src/routes/clientLawyerInquiry.route";

import {
  ClientConsultationBookingRoute,
  LawyerConsultationBookingRoute,
} from "../src/routes/consultationBooking.route";

import { SubscriptionPlanRoute } from "../src/routes/subscriptionPlan.route";
import {
  ClientOnlineContractRoute,
  LawyerOnlineContractRoute,
} from "../src/routes/onlineContract.route";

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
];

const app = new App(routes);

const database = new Database();

let connected = false;

let connectionPromise: Promise<void> | null = null;

async function ensureDatabaseConnection(): Promise<void> {
  if (connected) {
    return;
  }

  if (!connectionPromise) {
    connectionPromise = database
      .connect()
      .then(() => {
        connected = true;
      })
      .catch((error: unknown) => {
        connectionPromise = null;

        throw error;
      });
  }

  await connectionPromise;
}

export default async function handler(
  req: any,

  res: any,
) {
  try {
    await ensureDatabaseConnection();

    return app.getApp()(req, res);
  } catch (error: unknown) {
    console.error("[Vercel] Backend initialization failed:", error);

    if (!res.headersSent) {
      return res.status(500).json({
        success: false,

        code: "BACKEND_INITIALIZATION_FAILED",

        message: "راه‌اندازی سرویس بک‌اند انجام نشد.",
      });
    }

    return undefined;
  }
}
