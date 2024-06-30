import * as z from "zod"
import { CompleteUser, RelatedUserModel } from "./index"

export const FollowerModel = z.object({
  id: z.number().int(),
  followerId: z.number().int(),
  followingId: z.number().int(),
})

export interface CompleteFollower extends z.infer<typeof FollowerModel> {
  follower: CompleteUser
  following: CompleteUser
}

/**
 * RelatedFollowerModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedFollowerModel: z.ZodSchema<CompleteFollower> = z.lazy(() => FollowerModel.extend({
  follower: RelatedUserModel,
  following: RelatedUserModel,
}))
