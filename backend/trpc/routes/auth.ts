import * as z from "zod";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "../create-context";
import { createUser, loginUser, deleteSession } from "../../db/store";

export const authRouter = createTRPCRouter({
  register: publicProcedure
    .input(
      z.object({
        email: z.string().email("Please enter a valid email"),
        username: z.string().min(2, "Username must be at least 2 characters"),
        password: z.string().min(6, "Password must be at least 6 characters"),
      })
    )
    .mutation(({ input }) => {
      const result = createUser(input.email, input.username, input.password);
      if ("error" in result) {
        throw new Error(result.error);
      }
      return {
        token: result.token,
        user: {
          id: result.user.id,
          email: result.user.email,
          username: result.user.username,
        },
      };
    }),

  login: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(1),
      })
    )
    .mutation(({ input }) => {
      const result = loginUser(input.email, input.password);
      if ("error" in result) {
        throw new Error(result.error);
      }
      return {
        token: result.token,
        user: {
          id: result.user.id,
          email: result.user.email,
          username: result.user.username,
        },
      };
    }),

  me: protectedProcedure.query(({ ctx }) => {
    return {
      id: ctx.user.id,
      email: ctx.user.email,
      username: ctx.user.username,
    };
  }),

  logout: protectedProcedure.mutation(({ ctx }) => {
    if (ctx.token) {
      deleteSession(ctx.token);
    }
    return { success: true };
  }),
});
