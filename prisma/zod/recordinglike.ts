import * as z from "zod"
import { CompleteUser, RelatedUserModel, CompleteRecording, RelatedRecordingModel } from "./index"

export const RecordingLikeModel = z.object({
  id: z.number().int(),
  userId: z.number().int(),
  recordingId: z.number().int(),
})

export interface CompleteRecordingLike extends z.infer<typeof RecordingLikeModel> {
  user: CompleteUser
  recording: CompleteRecording
}

/**
 * RelatedRecordingLikeModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedRecordingLikeModel: z.ZodSchema<CompleteRecordingLike> = z.lazy(() => RecordingLikeModel.extend({
  user: RelatedUserModel,
  recording: RelatedRecordingModel,
}))
