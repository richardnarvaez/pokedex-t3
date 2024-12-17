import { appRouter } from "./api/root";
import { createServerSideHelpers } from "@trpc/react-query/server";
import { createTRPCContext } from "./api/trpc";
import superjson from "superjson";

export const helpers = createServerSideHelpers({
  router: appRouter,
  ctx: createTRPCContext({
    req: undefined,
    res: undefined,
  } as any),
  transformer: superjson,
}); 