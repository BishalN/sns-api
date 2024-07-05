import * as z from "zod"
import { CompleteFollower, RelatedFollowerModel, CompleteRecording, RelatedRecordingModel, CompleteLike, RelatedLikeModel, CompleteComment, RelatedCommentModel } from "./index"

export const UserModel = z.object({
  id: z.number().int(),
  email: z.string(),
  password: z.string(),
})

export interface CompleteUser extends z.infer<typeof UserModel> {
  followers: CompleteFollower[]
  following: CompleteFollower[]
  recordings: CompleteRecording[]
  recordingLikes: CompleteLike[]
  recordingComments: CompleteComment[]
}

/**
 * RelatedUserModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedUserModel: z.ZodSchema<CompleteUser> = z.lazy(() => UserModel.extend({
  followers: RelatedFollowerModel.array(),
  following: RelatedFollowerModel.array(),
  recordings: RelatedRecordingModel.array(),
  recordingLikes: RelatedLikeModel.array(),
  recordingComments: RelatedCommentModel.array(),
}))
