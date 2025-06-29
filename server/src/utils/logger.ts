import adze, { setup } from "adze";
import env from "../env.js";
import { DbLogger } from "../middlewares/dbLogger.ts";

const dbLogger = new DbLogger();
dbLogger.load();

setup({
  format: "pretty",
  activeLevel: env.LOG_LEVEL,
  middleware: [
    dbLogger
  ]
});

const logger = adze.timestamp.seal();
export default logger;
