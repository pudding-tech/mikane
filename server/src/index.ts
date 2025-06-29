import app from "./server.ts";
import env from "./env.ts";
import logger from "./utils/logger.ts";

// Listen for requests
app.listen(env.PORT, () => {
  logger.success(`Mikane server (${env.NODE_ENV} environment) running on port ${env.PORT}`);
});
