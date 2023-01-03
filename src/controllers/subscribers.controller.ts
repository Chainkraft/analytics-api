import { NextFunction, Request, Response } from 'express';
import SubscriberService from '@/services/subscribers.service';

class SubscribersController {
  public subscriberService = new SubscriberService();

  public createSubscriber = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const email = req.body.email;
      const listId = process.env.MAILCHIMP_LIST_ID;
      const addSubscriberData = await this.subscriberService.addSubscriber(email, listId);

      res.status(201).json({ data: addSubscriberData, message: 'created' });
    } catch (error) {
      error.message = error.response.body.title;
      next(error);
    }
  };
}

export default SubscribersController;
