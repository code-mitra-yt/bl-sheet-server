import { Model, model, Schema } from 'mongoose'
import { CustomModel } from '../../types/shared/shared.types'
import { Project } from '../../types/projects/project.types'

const projectShecma = new Schema<CustomModel<Project>>(
  {
    name: {
      type: String,
      require: true,
    },

    description: {
      type: String,
      required: true,
    },

    tags: {
      type: [String],
      default: [],
    },

    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },

  { timestamps: true }
)

const ProjectModel: Model<CustomModel<Project>> = model<CustomModel<Project>>(
  'Project',
  projectShecma
)

export default ProjectModel
