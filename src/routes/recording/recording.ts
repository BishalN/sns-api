import { OpenAPIHono } from "@hono/zod-openapi";
import jwt from "jsonwebtoken";
import { env } from "hono/adapter";
import { Env } from "../..";
import {
  createRecordingRoute,
  deleteRecordingRoute,
  getRecordingByIdRoute,
  updateRecordingRoute,
} from "./spec";
import { db } from "../../utils/db";
import { User } from "@prisma/client";

type Variables = {
  currentUser: User;
};

export const recordingRoute = new OpenAPIHono<{ Variables: Variables }>();

recordingRoute.use(async (c, next) => {
  // skip if the path is get recording by id
  if (c.req.method === "GET") {
    return next();
  }

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

recordingRoute.openapi(createRecordingRoute, async (c) => {
  const { title, url, isPublic } = c.req.valid("json");

  const currentUser = c.get("currentUser");

  const recording = await db.recording.create({
    data: { title, url, isPublic, userId: currentUser.id },
  });

  return c.json(recording, 200);
});

recordingRoute.openapi(getRecordingByIdRoute, async (c) => {
  const { id } = c.req.valid("param");
  console.log(c.get("currentUser"), "currentUser");
  const recording = await db.recording.findUnique({
    where: { id: Number(id), isPublic: true },
  });
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
