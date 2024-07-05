import { createRoute } from "@hono/zod-openapi";
import { z } from "zod";
import { UserModel } from "../../../prisma/zod";

export const registerRoute = createRoute({
  method: "post",
  path: "/register",
  request: {
    body: {
      content: {
        "application/json": {
          schema: UserModel.omit({ id: true }),
        },
      },
    },
  },
  // TODO: add error response schema as well
  responses: {
    200: {
      description: "User registered",
      content: {
        "application/json": {
          schema: UserModel.omit({ password: true }).extend({
            token: z.string(),
          }),
        },
      },
    },
  },
  tags: ["auth"],
});

export const loginRoute = createRoute({
  method: "post",
  path: "/login",
  request: {
    body: {
      content: {
        "application/json": {
          schema: UserModel.pick({ email: true, password: true }),
        },
      },
    },
  },
  responses: {
    200: {
      description: "User logged in",
      content: {
        "application/json": {
          schema: UserModel.omit({ password: true }).extend({
            token: z.string(),
          }),
        },
      },
    },
    401: {
      description: "Invalid Credentails",
      content: {
        "application/json": {
          schema: z.object({ message: z.string() }),
        },
      },
    },
  },
  tags: ["auth"],
});
