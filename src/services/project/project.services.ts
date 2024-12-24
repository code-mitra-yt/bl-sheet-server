import { ProjectModel } from '../../models'
import { Project } from '../../types/projects/project.types'

class ProjectService {
  constructor(private projectModel: typeof ProjectModel) {}

  async getProjectList(userId: string) {
    return this.projectModel.find({ userId })
  }

  async createProject(project: Project) {
    return this.projectModel.create(project)
  }

  async getProjectById(projectId: string) {
    return this.projectModel.findById(projectId)
  }
  async updateProject(project: Project) {
    return this.projectModel.findByIdAndUpdate(project._id, project, {
      new: true,
    })
  }

  async deleteProject(projectId: string) {
    return this.projectModel.findByIdAndUpdate(
      projectId,
      { isDeleted: true },
      {
        new: true,
      }
    )
  }
}

export default ProjectService
