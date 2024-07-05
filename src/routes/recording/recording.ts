import { OpenAPIHono } from "@hono/zod-openapi";
import jwt from "jsonwebtoken";
import { env } from "hono/adapter";
import { Env } from "../..";
import {
  createRecordingComment,
  createRecordingRoute,
  deleteRecordingComment,
  deleteRecordingRoute,
  generatePresignedUrlRoute,
  getMyRecordingsRoute,
  getRecordingByIdRoute,
  MAX_FILE_SIZE,
  toggleLikeRecording,
  updateRecordingComment,
  updateRecordingRoute,
} from "./spec";
import { db } from "../../utils/db";
import { User } from "@prisma/client";
import AWS from "aws-sdk";

import { getRecordingById } from "./services";

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

type Variables = {
  currentUser: User;
};

export const recordingRoute = new OpenAPIHono<{ Variables: Variables }>();

recordingRoute.use(async (c, next) => {
  // skip if the path is get recording by id also don't skip me route
  if (c.req.method === "GET" && !c.req.path.includes("me")) {
    return next();
  }

  // TODO: Fix: here cuz of the variable the type is not being inferred
  const { JWT_SECRET } = env<Env>(c as any);
  const token = c.req.header("authorize");
  if (!token) {
    return c.json({ message: "Unauthorized" }, 401);
  }

  try {
    const decodedUser = jwt.verify(token, JWT_SECRET) as { id: number };
    if (!decodedUser) {
      return c.json({ message: "Unauthorized" }, 401);
    }

    const user = await db.user.findUnique({
      where: { id: decodedUser.id },
    });
    if (!user) {
      return c.json({ message: "Unauthorized" }, 401);
    }

    c.set("currentUser", user);
  } catch (error) {
    return c.json({ message: "Unauthorized" }, 401);
  }

  return next();
});

recordingRoute.openapi(generatePresignedUrlRoute, async (c) => {
  const { fileName, fileType, fileSize } = c.req.valid("json");

  if (fileSize > MAX_FILE_SIZE) {
    return c.json({ message: "File size exceeds the 50MB limit" }, 400);
  }

  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: fileName,
    Expires: 60 * 2, // 2 minute
    ContentType: fileType,
  };

  const url = await s3.getSignedUrlPromise("putObject", params);

  return c.json({ url }, 200);
});

recordingRoute.openapi(createRecordingRoute, async (c) => {
  const { title, url, isPublic } = c.req.valid("json");

  const currentUser = c.get("currentUser");

  const recording = await db.recording.create({
    data: { title, url, isPublic, userId: currentUser.id },
  });

  return c.json(recording, 200);
});

// Discuss: This order is important which is wierd given proper paths and stuff
recordingRoute.openapi(getMyRecordingsRoute, async (c) => {
  const currentUser = c.get("currentUser");

  const recordings = await db.recording.findMany({
    where: { userId: currentUser.id },
  });

  return c.json(recordings, 200);
});

recordingRoute.openapi(getRecordingByIdRoute, async (c) => {
  const { id } = c.req.valid("param");
  const recording = await getRecordingById(+id);

  if (!recording) {
    return c.json({ message: "Recording not found" }, 404);
  }
  return c.json(recording, 200);
});

recordingRoute.openapi(updateRecordingRoute, async (c) => {
  const { id } = c.req.valid("param");
  console.log(id, "id");
  const { title, url, isPublic } = c.req.valid("json");

  const currentUser = c.get("currentUser");

  try {
    const recording = await db.recording.update({
      where: { id: Number(id), userId: currentUser.id },
      data: { title, url, isPublic },
    });

    return c.json(recording, 200);
  } catch (error) {
    console.log(error);
    return c.json({ message: "Unauthorized" }, 401);
  }
});

recordingRoute.openapi(deleteRecordingRoute, async (c) => {
  const { id } = c.req.valid("param");

  const currentUser = c.get("currentUser");

  try {
    await db.recording.delete({
      where: { id: Number(id), userId: currentUser.id },
    });

    return c.json({ message: "Recording deleted" }, 200);
  } catch (error) {
    console.log(error);
    return c.json({ message: "Unauthorized" }, 401);
  }
});

recordingRoute.openapi(toggleLikeRecording, async (c) => {
  const { id } = c.req.valid("param");

  const currentUser = c.get("currentUser");

  const recording = await db.recording.findUnique({
    where: { id: Number(id) },
    include: { likes: true },
  });

  if (!recording) {
    return c.json({ message: "Recording not found" }, 404);
  }

  const isLiked = recording.likes.find(
    (like) => like.userId === currentUser.id
  );

  if (isLiked) {
    await db.like.delete({
      where: { id: isLiked.id },
    });
  } else {
    await db.like.create({
      data: {
        userId: currentUser.id,
        recordingId: recording.id,
      },
    });
  }

  return c.json({ message: "Like Toggled" }, 200);
});

recordingRoute.openapi(createRecordingComment, async (c) => {
  const { id } = c.req.valid("param");
  const { content } = c.req.valid("json");

  const currentUser = c.get("currentUser");

  const recording = await db.recording.findUnique({
    where: { id: Number(id) },
  });

  if (!recording) {
    return c.json({ message: "Recording not found" }, 404);
  }

  const comment = await db.comment.create({
    data: {
      content,
      userId: currentUser.id,
      recordingId: recording.id,
    },
  });

  return c.json(comment, 200);
});

recordingRoute.openapi(updateRecordingComment, async (c) => {
  const { id } = c.req.valid("param");
  const { content, id: commentId } = c.req.valid("json");

  const currentUser = c.get("currentUser");

  const recording = await db.recording.findUnique({
    where: { id: Number(id) },
  });
  if (!recording) {
    return c.json({ message: "Recording not found" }, 404);
  }

  const comment = await db.comment.findUnique({
    where: { id: Number(commentId) },
  });

  if (!comment) {
    return c.json({ message: "Comment not found" }, 404);
  }

  if (comment.userId !== currentUser.id) {
    return c.json({ message: "Unauthorized" }, 401);
  }

  const updatedComment = await db.comment.update({
    where: { id: Number(commentId) },
    data: { content },
  });

  return c.json(updatedComment, 200);
});

recordingRoute.openapi(deleteRecordingComment, async (c) => {
  const { id, commentId } = c.req.valid("param");

  const currentUser = c.get("currentUser");

  const recording = await db.recording.findUnique({
    where: { id: Number(id) },
  });
  if (!recording) {
    return c.json({ message: "Recording not found" }, 404);
  }

  // TODO: This is a long way of doing things, asking for permission to delete a comment
  // instead of just deleting it and catch the error if it's not found
  // Here no need to check if it exists or not, as well as authorization is done in single step
  // await db.comment.delete({
  //   where: { id: Number(commentId), userId: currentUser.id },
  // });
  // ask this question on twitter / discussion on prisma discussion

  const comment = await db.comment.findUnique({
    where: { id: Number(commentId) },
  });

  if (!comment) {
    return c.json({ message: "Comment not found" }, 404);
  }

  if (comment.userId !== currentUser.id) {
    return c.json({ message: "Unauthorized" }, 401);
  }

  await db.comment.delete({
    where: { id: Number(commentId) },
  });

  return c.json({ message: "Comment deleted" }, 200);
});
