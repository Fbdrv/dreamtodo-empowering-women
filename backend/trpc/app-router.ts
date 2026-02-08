import { createTRPCRouter } from "./create-context";
import { authRouter } from "./routes/auth";
import { userDataRouter } from "./routes/userData";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  userData: userDataRouter,
});

export type AppRouter = typeof appRouter;
