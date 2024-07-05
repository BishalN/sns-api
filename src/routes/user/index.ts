import { OpenAPIHono } from "@hono/zod-openapi";
import { User } from "@prisma/client";
import { db } from "../../utils/db";
import jwt from "jsonwebtoken";
import { followUser, unfollowUser } from "./spec";

// TODO: make this variable to middle part more reusable
type Variables = {
  currentUser: User;
};
export const userRoute = new OpenAPIHono<{ Variables: Variables }>();
userRoute.use(async (c, next) => {
  // TODO: Fix: here cuz of the variable the type is not being inferred
  const JWT_SECRET = process.env.JWT_SECRET as string;
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

userRoute.openapi(followUser, async (c) => {
  const { id } = c.req.valid("param");
  const currentUser = c.get("currentUser");

  const user = await db.user.findUnique({
    where: { id: Number(id) },
  });
  if (!user) {
    return c.json({ message: "User not found" }, 404);
  }

  // check if user is already following using foreign index follower following key
  const isFollowing = await db.follower.findFirst({
    where: {
      followerId: currentUser.id,
      followingId: user.id,
    },
  });

  if (isFollowing) {
    return c.json({ message: "User already followed" }, 409);
  }

  await db.follower.create({
    data: {
      followerId: currentUser.id,
      followingId: user.id,
    },
  });

  return c.json({ message: "User followed" });
});

userRoute.openapi(unfollowUser, async (c) => {
  const { id } = c.req.valid("param");
  const currentUser = c.get("currentUser");

  const user = await db.user.findUnique({
    where: { id: Number(id) },
  });
  if (!user) {
    return c.json({ message: "User not found" }, 404);
  }

  // check if user is already following using foreign index follower following key
  const isFollowing = await db.follower.findFirst({
    where: {
      followerId: currentUser.id,
      followingId: user.id,
    },
  });

  if (!isFollowing) {
    return c.json({ message: "User already unfollowed" }, 409);
  }

  await db.follower.delete({
    where: {
      id: isFollowing.id,
    },
  });

  return c.json({ message: "User unfollowed" });
});
