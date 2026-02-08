import * as z from "zod";
import { createTRPCRouter, protectedProcedure } from "../create-context";
import { saveUserData, getUserData } from "../../db/store";

export const userDataRouter = createTRPCRouter({
  getData: protectedProcedure.query(({ ctx }) => {
    const data = getUserData(ctx.user.id);
    return { data };
  }),

  saveData: protectedProcedure
    .input(
      z.object({
        data: z.record(z.string(), z.unknown()),
      })
    )
    .mutation(({ ctx, input }) => {
      const success = saveUserData(ctx.user.id, input.data);
      return { success };
    }),
});
