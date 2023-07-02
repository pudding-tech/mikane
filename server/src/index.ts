import app from "./server";
import env from "./env";

// Listen for requests
app.listen(env.PORT, () => {
  console.log("Mikane server running on port " + env.PORT);
});
