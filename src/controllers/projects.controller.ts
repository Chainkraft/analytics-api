import { NextFunction, Request, Response } from 'express';
import ProjectService from '@services/project.service';
import ContractService from '@services/contracts.service';

class ProjectsController {
  public projectService = new ProjectService();
  public contractService = new ContractService();

  public getAllProjects = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const projects = await this.projectService.findAllProjects();
      res.json({ data: projects });
    } catch (error) {
      next(error);
    }
  };

  public getProject = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const slug = req.params.slug;
      const project = await this.projectService.findProjectBySlug(slug);
      res.json(project);
    } catch (error) {
      next(error);
    }
  };
}

export default ProjectsController;
