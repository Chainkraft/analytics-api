import { NextFunction, Request, Response } from 'express';
import ProtocolsService from '@services/protocols.service';

class ProtocolsController {
  public protocolService = new ProtocolsService();

  public getAllProtocols = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const projects = await this.protocolService.findAllProtocols();
      res.json({ data: projects });
    } catch (error) {
      next(error);
    }
  };

  public getProtocol = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const slug = req.params.slug;
      const project = await this.protocolService.findProtocolBySlug(slug);
      res.json(project);
    } catch (error) {
      next(error);
    }
  };
}

export default ProtocolsController;
