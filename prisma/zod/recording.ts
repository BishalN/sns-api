import * as z from "zod"
import { CompleteUser, RelatedUserModel, CompleteRecordingLike, RelatedRecordingLikeModel, CompleteComment, RelatedCommentModel } from "./index"

export const RecordingModel = z.object({
  id: z.number().int(),
  title: z.string(),
  url: z.string(),
  isPublic: z.boolean(),
  userId: z.number().int(),
})

export interface CompleteRecording extends z.infer<typeof RecordingModel> {
  user: CompleteUser
  likes: CompleteRecordingLike[]
  comments: CompleteComment[]
}

/**
 * RelatedRecordingModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedRecordingModel: z.ZodSchema<CompleteRecording> = z.lazy(() => RecordingModel.extend({
  user: RelatedUserModel,
  likes: RelatedRecordingLikeModel.array(),
  comments: RelatedCommentModel.array(),
}))
