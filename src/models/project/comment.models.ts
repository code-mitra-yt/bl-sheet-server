import { Model, model, Schema } from 'mongoose'
import { Comment, CustomModel } from '../../types/shared/shared.types'

const commentSchema = new Schema<CustomModel<Comment>>(
  {
    content: { type: String, return: true },
    memberId: { type: Schema.Types.ObjectId, ref: 'Member', required: true },
    likes: { type: Number, default: 0 },
    replies: [{ type: Schema.Types.ObjectId, ref: 'comment', default: [] }],
    commentType: { type: String, required: false, default: 'General' },
  },
  { timestamps: true }
)

const CommentModel: Model<CustomModel<Comment>> = model<CustomModel<Comment>>(
  'Comment',
  commentSchema
)

export default CommentModel
