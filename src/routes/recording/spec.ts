import { createRoute } from "@hono/zod-openapi";
import { z } from "zod";
import {
  CommentModel,
  LikeModel,
  RecordingModel,
  RelatedRecordingModel,
} from "../../../prisma/zod";
import { TestRes } from "./services";

export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
export const generatePresignedUrlRoute = createRoute({
  method: "post",
  path: "/generate-presigned-url",
  security: [{ Bearer: [] }],
  request: {
    headers: z.object({
      authorize: z.string(),
    }),
    body: {
      content: {
        "application/json": {
          schema: z.object({
            fileName: z.string(),
            fileType: z.string(),
            fileSize: z.number().max(MAX_FILE_SIZE),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      description: "Presigned URL generated",
      content: {
        "application/json": {
          schema: z.object({
            url: z.string(),
          }),
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
    400: {
      description: "File size exceeds limit",
      content: {
        "application/json": {
          schema: z.object({ message: z.string() }),
        },
      },
    },
  },
  tags: ["upload"],
});

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
      // TODO: fix: use authoirzation header instead; this is due to swagger-ui does not allow authorization header otherwise we can use it without any changes
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
          // TODO: infer the type from the service response and use it here
          schema: TestRes,
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

export const getMyRecordingsRoute = createRoute({
  method: "get",
  path: "/me",
  security: [{ Bearer: [] }],
  request: {
    headers: z.object({
      authorize: z.string(),
    }),
  },
  responses: {
    200: {
      description: "Recordings found",
      content: {
        "application/json": {
          schema: z.array(RecordingModel),
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
  description: "Delete recording",
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

export const toggleLikeRecording = createRoute({
  method: "put",
  path: "/{id}/like",
  description: "Toggle like on recording",
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
      description: "Toggle Recording like",
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
      description: "Recording not found",
      content: {
        "application/json": {
          schema: z.object({ message: z.string() }),
        },
      },
    },
  },
});

export const createRecordingComment = createRoute({
  method: "post",
  path: "/{id}/comment",
  description: "Create comment on recording",
  security: [{ Bearer: [] }],
  request: {
    headers: z.object({
      authorize: z.string(),
    }),
    params: z.object({
      id: z.string().openapi({
        description: "Recording ID",
      }),
    }),
    body: {
      content: {
        "application/json": {
          schema: CommentModel.pick({ content: true }),
        },
      },
    },
  },
  responses: {
    200: {
      description: "Comment created",
      content: {
        "application/json": {
          schema: CommentModel,
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
      description: "Recording not found",
      content: {
        "application/json": {
          schema: z.object({ message: z.string() }),
        },
      },
    },
  },
});

export const updateRecordingComment = createRoute({
  method: "put",
  path: "/{id}/comment",
  description: "Update comment on recording",
  security: [{ Bearer: [] }],
  request: {
    headers: z.object({
      authorize: z.string(),
    }),
    params: z.object({
      id: z.string().openapi({
        description: "Recording ID",
      }),
    }),
    body: {
      content: {
        "application/json": {
          schema: CommentModel.pick({ content: true, id: true }),
        },
      },
    },
  },
  responses: {
    200: {
      description: "Comment updated",
      content: {
        "application/json": {
          schema: CommentModel,
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
      description: "Recording or Comment not found",
      content: {
        "application/json": {
          schema: z.object({ message: z.string() }),
        },
      },
    },
  },
});

export const deleteRecordingComment = createRoute({
  method: "delete",
  path: "/{id}/comment/{commentId}",
  description: "Delete comment on recording",
  security: [{ Bearer: [] }],
  request: {
    headers: z.object({
      authorize: z.string(),
    }),
    params: z.object({
      id: z.string().openapi({
        description: "Recording ID",
      }),
      commentId: z.string(),
    }),
  },
  responses: {
    200: {
      description: "Comment deleted",
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
      description: "Recording or Comment not found",
      content: {
        "application/json": {
          schema: z.object({ message: z.string() }),
        },
      },
    },
  },
});
