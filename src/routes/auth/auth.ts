import { OpenAPIHono } from "@hono/zod-openapi";
import argon2 from "argon2";
import { env } from "hono/adapter";
import { Env } from "../..";
import { signToken } from "../../utils/sign";
import { loginRoute, registerRoute } from "./spec";
import { db } from "../../utils/db";

export const authRoute = new OpenAPIHono();

authRoute.openapi(registerRoute, async (c) => {
  const { email, password } = c.req.valid("json");

  const hashedPassword = await argon2.hash(password);

  // TODO: handle error if user already exists with same email
  const user = await db.user.create({
    data: { email, password: hashedPassword },
  });

  const { JWT_SECRET } = env<Env>(c);
  const token = signToken(JWT_SECRET, { id: user.id });

  return c.json(
    {
      id: user.id,
      email: user.email,
      token,
    },
    200
  );
});

authRoute.openapi(loginRoute, async (c) => {
  const { email, password } = c.req.valid("json");

  const user = await db.user.findUnique({ where: { email } });

  // TODO: Maybe don't even give a hint through status code use 401 for both
  if (!user) {
    return c.json({ message: "Invalid Credentails" }, 401);
  }

  const valid = await argon2.verify(user.password, password);

  if (!valid) {
    return c.json({ message: "Invalid Credentails" }, 401);
  }

  const { JWT_SECRET } = env<Env>(c);
  const token = await signToken(JWT_SECRET, { id: user.id });

  return c.json(
    {
      id: user.id,
      email: user.email,
      token,
    },
    200
  );
});
