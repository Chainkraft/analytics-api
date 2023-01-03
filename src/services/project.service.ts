import { HttpException } from '@exceptions/HttpException';
import { isEmpty } from '@utils/util';
import projectModel from '@models/project.model';
import { Project } from '@interfaces/projects.interface';
import slug from 'slug';

class ProjectService {
  public project = projectModel;

  public async findAllProjects(): Promise<Project[]> {
    return this.project.find();
  }

  public async findProjectBySlug(slug: string): Promise<Project> {
    if (isEmpty(slug)) throw new HttpException(400, 'Name is empty');

    const project: Project = await this.project.findOne({ slug });
    if (!project) throw new HttpException(404, 'Project doesn\'t exist');

    return project;
  }

  public async createOrUpdateProject(project: Project): Promise<Project> {
    if (isEmpty(project)) throw new HttpException(400, 'Project is empty');
    if (isEmpty(project._id)) {
      project.slug = slug(project.name);
    }

    return this.project.findOneAndUpdate({ slug: project.slug }, project, {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    });
  }
}

export default ProjectService;
