import { createRoute } from "@hono/zod-openapi";
import { z } from "zod";

export const followUser = createRoute({
  method: "put",
  path: "/{id}/follow",
  description: "Follow a user",
  security: [{ Bearer: [] }],
  request: {
    headers: z.object({
      authorize: z.string(),
    }),
    params: z.object({
      id: z.string().openapi({
        description: "The user id to follow",
        example: "1",
      }),
    }),
  },
  responses: {
    200: {
      description: "User followed",
      content: {
        "application/json": {
          schema: z.object({ message: z.string() }),
        },
      },
    },
    401: {
      description: "Unauthorized",
      content: {
        "application/json": {
          schema: z.object({ message: z.string() }),
        },
      },
    },
    404: {
      description: "User not found",
      content: {
        "application/json": {
          schema: z.object({ message: z.string() }),
        },
      },
    },
    // what about user already followed?
    // Or may be silently ignore? this state?
    // This code is useful in email already used stuff
    409: {
      description: "User already followed",
      content: {
        "application/json": {
          schema: z.object({ message: z.string() }),
        },
      },
    },
  },
  tags: ["User"],
});

export const unfollowUser = createRoute({
  method: "put",
  path: "/{id}/unfollow",
  description: "Unfollow a user",
  security: [{ Bearer: [] }],
  request: {
    headers: z.object({
      authorize: z.string(),
    }),
    params: z.object({
      id: z.string().openapi({
        description: "The user id to unfollow",
      }),
    }),
  },
  responses: {
    200: {
      description: "User unfollowed",
      content: {
        "application/json": {
          schema: z.object({ message: z.string() }),
        },
      },
    },
    401: {
      description: "Unauthorized",
      content: {
        "application/json": {
          schema: z.object({ message: z.string() }),
        },
      },
    },
    404: {
      description: "User not found",
      content: {
        "application/json": {
          schema: z.object({ message: z.string() }),
        },
      },
    },
    409: {
      description: "User already unfollowed",
      content: {
        "application/json": {
          schema: z.object({ message: z.string() }),
        },
      },
    },
  },
  tags: ["User"],
});
