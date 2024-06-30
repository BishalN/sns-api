import { serve } from "@hono/node-server";
import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { swaggerUI } from "@hono/swagger-ui";
import argon2 from "argon2";
import { PrismaClient } from "@prisma/client";
import { UserModel } from "../prisma/zod";
import jwt from "jsonwebtoken";
import { env } from "hono/adapter";

const prisma = new PrismaClient();

const app = new OpenAPIHono();

const registerRoute = createRoute({
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
          schema: UserModel.omit({ password: true }),
        },
      },
    },
  },
});
app.openapi(registerRoute, async (c) => {
  const { email, password } = c.req.valid("json");

  const hashedPassword = await argon2.hash(password);

  // TODO: handle error if user already exists with same email
  const user = await prisma.user.create({
    data: { email, password: hashedPassword },
  });

  // TODO: generate a token and send it back to the user
  return c.json(
    {
      id: user.id,
      email: user.email,
    },
    200
  );
});

const loginRoute = createRoute({
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
    404: {
      description: "Invalid Credentails",
      content: {
        "application/json": {
          schema: z.object({ message: z.string() }),
        },
      },
    },
  },
});
app.openapi(loginRoute, async (c) => {
  const { email, password } = c.req.valid("json");

  const user = await prisma.user.findUnique({ where: { email } });

  // TODO: Maybe don't even give a hint through status code use 401 for both
  if (!user) {
    return c.json({ message: "Invalid Credentails" }, 404);
  }

  const valid = await argon2.verify(user.password, password);

  if (!valid) {
    return c.json({ message: "Invalid Credentails" }, 401);
  }

  const { JWT_SECRET } = env<{ JWT_SECRET: string }>(c);
  const token = jwt.sign({ id: user.id }, JWT_SECRET);
  return c.json(
    {
      id: user.id,
      email: user.email,
      token,
    },
    200
  );
});

// Use the middleware to serve Swagger UI at /ui
app.get("/ui", swaggerUI({ url: "/doc" }));

// The OpenAPI documentation will be available at /doc
app.doc("/doc", {
  openapi: "3.0.0",
  info: { title: "Sing and Share API", version: "1.0.0" },
});

const port = 3000;
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});
