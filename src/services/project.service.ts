import { HttpException } from '@exceptions/HttpException';
import { isEmpty } from '@utils/util';
import projectModel from '@models/project.model';
import { Project } from '@interfaces/projects.interface';

class ProjectService {
  public project = projectModel;

  public async findAllProjects(): Promise<Project[]> {
    return await this.project.find();
  }

  public async findProjectByName(name: string): Promise<Project> {
    if (isEmpty(name)) throw new HttpException(400, 'Name is empty');

    const project: Project = await this.project.findOne({ name });
    if (!project) throw new HttpException(409, 'Project doesn\'t exist');

    return project;
  }

  public async createProject(project: Project): Promise<Project> {
    if (isEmpty(project)) throw new HttpException(400, 'Project is empty');
    return await this.project.create(project);
  }
}

export default ProjectService;
