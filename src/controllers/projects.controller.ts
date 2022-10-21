import { NextFunction, Request, Response } from 'express';
import ProjectService from '@services/project.service';

class ProjectsController {
  public projectService = new ProjectService();

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
      res.json({ data: project });
    } catch (error) {
      next(error);
    }
  };
}

export default ProjectsController;
