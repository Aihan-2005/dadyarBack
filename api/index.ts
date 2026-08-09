import App from "../src/app";

import IndexRoute from "../src/routes/index.route";
import LawyerRoute from "../src/routes/lawyer.route";
import AuthRoute from "../src/routes/auth.route";
import CaseRoute from "../src/routes/case.route";

import { Database } from "../src/config/db";


const routes = [
  new IndexRoute(),
  new LawyerRoute(),
  new AuthRoute(),
  new CaseRoute(),
];


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