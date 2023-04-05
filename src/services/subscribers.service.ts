import { HttpException } from '@exceptions/HttpException';
import { isEmpty } from '@utils/util';
import subscribersModel from '@models/subscribers.model';
import { AccessRequest } from '@interfaces/subscribers.interface';
import { AccessRequestDto } from '@dtos/subscribers.dto';
import promClient from 'prom-client';

class SubscriberService {
  public accessRequests = subscribersModel;

  public async saveAccessRequest(accessRequest: AccessRequestDto, ip: string): Promise<AccessRequest> {
    if (isEmpty(accessRequest)) throw new HttpException(400, 'Request data is empty');
    const counter = new promClient.Counter({
      name: 'request_access_count',
      help: 'number of user request access',
    });
    counter.inc();
    return this.accessRequests.create({ ...accessRequest, ip });
  }
}

export default SubscriberService;
