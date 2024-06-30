import * as z from "zod"
import { CompleteUser, RelatedUserModel, CompleteRecording, RelatedRecordingModel } from "./index"

export const CommentModel = z.object({
  id: z.number().int(),
  content: z.string(),
  userId: z.number().int(),
  recordingId: z.number().int(),
})

export interface CompleteComment extends z.infer<typeof CommentModel> {
  user: CompleteUser
  recording: CompleteRecording
}

/**
 * RelatedCommentModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedCommentModel: z.ZodSchema<CompleteComment> = z.lazy(() => CommentModel.extend({
  user: RelatedUserModel,
  recording: RelatedRecordingModel,
}))
