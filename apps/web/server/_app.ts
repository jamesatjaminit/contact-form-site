import { z } from "zod";
import { procedure, router } from "./trpc";
import formRouter from "./routers/form";

export const appRouter = router({
  form: formRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
