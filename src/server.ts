import App from "./app";
import { Database } from "./config/db";
import AuthRoute from "./routes/auth.route";
import CaseRoute from "./routes/case.route";
import IndexRoute from "./routes/index.route";
import LawyerRoute from "./routes/lawyer.route";

(async () => {
  await new Database().connect();
})();

const app = new App([
  new IndexRoute(),
  new LawyerRoute(),
  new AuthRoute(),
  new CaseRoute(),
]);

app.listen();
