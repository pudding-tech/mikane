import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],
    reporters: ["verbose"],
    setupFiles: ["./tests/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["json", "html"]
    },
    onConsoleLog (log) {
      if (log.includes("Connected to SQL database")) return false;
      if (log.includes("Session store connected")) return false;
      if (log.includes("signing in -")) return false;
      if (log.includes("successfully signed out")) return false;
      if (log.includes("but is already authenticated")) return false;
      if (log.includes("Mocking Postmark sendEmail")) return false;
      if (log.includes("sent to")) return false;
    }
  }
});
