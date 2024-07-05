import * as z from "zod"
import { CompleteUser, RelatedUserModel, CompleteRecording, RelatedRecordingModel } from "./index"

export const LikeModel = z.object({
  id: z.number().int(),
  userId: z.number().int(),
  recordingId: z.number().int(),
})

export interface CompleteLike extends z.infer<typeof LikeModel> {
  user: CompleteUser
  recording: CompleteRecording
}

/**
 * RelatedLikeModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedLikeModel: z.ZodSchema<CompleteLike> = z.lazy(() => LikeModel.extend({
  user: RelatedUserModel,
  recording: RelatedRecordingModel,
}))
