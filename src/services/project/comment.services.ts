import { CommentModel } from '../../models'
import { Comment } from '../../types/shared/shared.types'

class CommentService {
  constructor(private commentModel: typeof CommentModel) {}

  async createComment(comment: Partial<Comment>) {
    return this.commentModel.create(comment)
  }

  async getCommentById(commentId: string) {
    return this.commentModel.findById(commentId)
  }

  async updateComment(comment: Partial<Comment>, commentId: string) {
    return await this.commentModel.findByIdAndUpdate(commentId, comment, {
      new: true,
    })
  }
}

export default CommentService
