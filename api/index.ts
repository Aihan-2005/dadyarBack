import App from "../src/app";

import { env } from "../src/config/env";
import { Database } from "../src/config/db";

import type { Route } from "../src/interfaces/route.interface";

import IndexRoute from "../src/routes/index.route";
import LawyerRoute from "../src/routes/lawyer.route";
import AuthRoute from "../src/routes/auth.route";
import CaseRoute from "../src/routes/case.route";
import LawyerClientRoute from "../src/routes/lawyerClient.route";
import { FinancialReportRoute } from "../src/routes/financialReport.route";
import { ApiDocsRoute } from "../src/routes/apiDocs.route";
import NotificationRoute from "../src/routes/notification.route";
import TicketRoute from "../src/routes/ticket.route";
import ClientCaseRoute from "../src/routes/clientCase.route";

const routes: Route[] = [
  new IndexRoute(),
  new LawyerRoute(),
  new AuthRoute(),
  new CaseRoute(),
  new LawyerClientRoute(),
  new FinancialReportRoute(),
  new NotificationRoute(),
  new TicketRoute(),
  new ClientCaseRoute(),
];

if (env.ENABLE_API_DOCS) {
  routes.push(new ApiDocsRoute());
}

const app = new App(routes);

const database = new Database();

let connected = false;

export default async function handler(req: any, res: any) {
  if (!connected) {
    await database.connect();
    connected = true;
  }

  return app.getApp()(req, res);
}
