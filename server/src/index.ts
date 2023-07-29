import app from "./server";
import env from "./env";

// Listen for requests
app.listen(env.PORT, () => {
  console.log(`Mikane server (${env.NODE_ENV} environment) running on port ${env.PORT}`);
});
