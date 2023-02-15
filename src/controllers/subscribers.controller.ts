import { NextFunction, Request, Response } from 'express';
import SubscriberService from '@services/subscribers.service';
import { AccessRequestDto } from '@dtos/subscribers.dto';

class SubscribersController {
  public accessRequestService = new SubscriberService();

  public saveAccessRequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const requestAccess: AccessRequestDto = req.body;
      await this.accessRequestService.saveAccessRequest(requestAccess, req.ip);
      res.status(201).end();
    } catch (error) {
      error.message = error.response.body.title;
      next(error);
    }
  };
}

export default SubscribersController;
