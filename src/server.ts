import App from "./app";
import { Database } from "./config/db";
import IndexRoute from "./routes/index.route";
import LawyerRoute from "./routes/lawyer.route";


// await (new Database(env)).connect()

const app = new App([
  new IndexRoute(),
  new LawyerRoute(),
])

app.listen()
