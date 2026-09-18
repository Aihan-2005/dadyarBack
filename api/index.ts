import App from "../src/app";

import { Database } from "../src/config/db";

import type { Route } from "../src/interfaces/route.interface";

import IndexRoute from "../src/routes/index.route";

import LawyerRoute from "../src/routes/lawyer.route";

import AuthRoute from "../src/routes/auth.route";

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

  new LawyerClientInquiryRoute(),

  new LawyerConsultationBookingRoute(),

  new AdminRoute(),

  new FAQRoute(),

  new ApiDocsRoute(),

  new SubscriptionPlanRoute(),
];

const app = new App(routes);

const database = new Database();

let connected = false;

export default async function handler(
  req: any,

  res: any,
) {
  if (!connected) {
    await database.connect();

    connected = true;
  }

  return app.getApp()(
    req,

    res,
  );
}
