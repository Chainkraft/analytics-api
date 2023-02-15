import { HttpException } from '@exceptions/HttpException';
import { isEmpty } from '@utils/util';
import subscribersModel from '@models/subscribers.model';
import { AccessRequest } from '@interfaces/subscribers.interface';
import { AccessRequestDto } from '@dtos/subscribers.dto';

class SubscriberService {
  public accessRequests = subscribersModel;

  public async saveAccessRequest(accessRequest: AccessRequestDto, ip: string): Promise<AccessRequest> {
    if (isEmpty(accessRequest)) throw new HttpException(400, 'Request data is empty');
    return this.accessRequests.create({ ...accessRequest, ip });
  }
}

export default SubscriberService;
