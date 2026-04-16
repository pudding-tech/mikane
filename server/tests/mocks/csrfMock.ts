import { vi } from "vitest";

vi.mock("../../src/middlewares/csrf.ts", async () => {
  const actual = await vi.importActual<typeof import("../../src/middlewares/csrf.ts")>("../../src/middlewares/csrf.ts");
  return {
    ...actual,
    csrfCheck: vi.fn((_req, _res, next) => next())
  };
});
