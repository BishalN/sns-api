import { db } from "../../utils/db";
import { z } from "zod";
import { RecordingModel } from "../../../prisma/zod";

export const getRecordingById = (id: number) => {
  return db.recording.findUnique({
    where: { id, isPublic: true },
    include: {
      comments: {
        select: {
          content: true,
          id: true,
          user: {
            select: {
              email: true,
              id: true,
            },
          },
        },
      },
      likes: {
        select: {
          user: {
            select: {
              id: true,
            },
          },
        },
      },
      user: {
        select: {
          email: true,
        },
      },
    },
  });
};

// After adding tests these things can actually be tested than just static types analysis
//TODO: Fix add satisfies Promise<z.infer<typeof RecordingModel>>; similar to this
//TODO: Use ts to to zod library to generate the zod schema
export const TestRes = RecordingModel.extend({
  likes: z.array(
    z.object({
      user: z.object({
        id: z.number(),
      }),
    })
  ),
  comments: z.array(
    z.object({
      id: z.number(),
      content: z.string(),
      user: z.object({
        id: z.number(),
        email: z.string(),
      }),
    })
  ),
  user: z.object({
    email: z.string(),
  }),
});
