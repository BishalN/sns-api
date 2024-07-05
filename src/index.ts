import { serve } from "@hono/node-server";
import { OpenAPIHono } from "@hono/zod-openapi";
import { swaggerUI } from "@hono/swagger-ui";

import { authRoute } from "./routes/auth/auth";
import { recordingRoute } from "./routes/recording/recording";
import { logger } from "hono/logger";
import { PrismaClient } from "@prisma/client";

type Variables = {
  db: PrismaClient;
};

export const app = new OpenAPIHono<{ Variables: Variables }>();

// TODO: add db to the context object of hono -> use epic web remember to creater skeleton
// TODO: add user to the context object of hono using middle ware

export type Env = {
  JWT_SECRET: string;
  DATABASE_URL: string;
};

app.use(logger());

app.route("/auth", authRoute);
app.route("/recording", recordingRoute);

app.openAPIRegistry.registerComponent("securitySchemes", "Bearer", {
  type: "http",
  scheme: "bearer",
});

// The OpenAPI documentation will be available at /doc
app.doc("/doc", {
  openapi: "3.0.0",
  info: { title: "Sing and Share API", version: "1.0.0" },
});

// Use the middleware to serve Swagger UI at /ui
app.get("/ui", swaggerUI({ url: "/doc" }));

const port = 3000;
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});
