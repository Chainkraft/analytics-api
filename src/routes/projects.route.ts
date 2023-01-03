import { Router } from 'express';
import { Routes } from '@interfaces/routes.interface';
import ProjectsController from '@controllers/projects.controller';

class ProjectsRoute implements Routes {
  public path = '/defi';
  public router = Router();
  public projectsController = new ProjectsController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}`, this.projectsController.getAllProjects);
    this.router.get(`${this.path}/:slug`, this.projectsController.getProject);
  }
}

export default ProjectsRoute;
