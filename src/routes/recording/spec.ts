import { createRoute } from "@hono/zod-openapi";
import { z } from "zod";
import { RecordingModel } from "../../../prisma/zod";

export const createRecordingRoute = createRoute({
  method: "post",
  path: "/",
  security: [
    {
      Bearer: [], // <- Add security name (must be same)
    },
  ],
  request: {
    headers: z.object({
      // TODO: fix: use authoirzation header instead; this is due to swagger-ui does not allow authorization header
      authorize: z.string(),
    }),
    body: {
      content: {
        "application/json": {
          schema: RecordingModel.omit({ id: true, userId: true }),
        },
      },
    },
  },
  responses: {
    200: {
      description: "Recording created",
      content: {
        "application/json": {
          schema: RecordingModel,
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
  },
  tags: ["recording"],
});

export const getRecordingByIdRoute = createRoute({
  method: "get",
  path: "/{id}",
  request: {
    params: z.object({
      id: z.string().openapi({
        param: {
          name: "id",
          in: "path",
        },
        type: "integer", // <- you can still add type by adding key type
        example: "1",
      }),
    }),
  },
  responses: {
    200: {
      description: "Recording found",
      content: {
        "application/json": {
          schema: RecordingModel,
        },
      },
    },
    404: {
      description: "Recording not found",
      content: {
        "application/json": {
          schema: z.object({ message: z.string() }),
        },
      },
    },
  },
  tags: ["recording"],
});

export const updateRecordingRoute = createRoute({
  method: "put",
  path: "/{id}",
  security: [{ Bearer: [] }],
  request: {
    headers: z.object({
      authorize: z.string(),
    }),
    params: z.object({
      id: z.string().openapi({
        param: {
          name: "id",
          in: "path",
        },
        type: "integer", // <- you can still add type by adding key type
        example: "1",
      }),
    }),
    body: {
      content: {
        "application/json": {
          schema: RecordingModel.omit({ id: true, userId: true }),
        },
      },
    },
  },
  responses: {
    200: {
      description: "Recording updated",
      content: {
        "application/json": {
          schema: RecordingModel,
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
  },
  tags: ["recording"],
});

export const deleteRecordingRoute = createRoute({
  method: "delete",
  path: "/{id}",
  security: [{ Bearer: [] }],
  request: {
    headers: z.object({
      authorize: z.string(),
    }),
    params: z.object({
      id: z.string(),
    }),
  },
  responses: {
    200: {
      description: "Recording deleted",
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
  },
  tags: ["recording"],
});