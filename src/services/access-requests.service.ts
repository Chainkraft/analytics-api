import { HttpException } from '@exceptions/HttpException';
import { isEmpty } from '@utils/util';
import accessRequestsModel from '@models/access-requests.model';
import { AccessRequest } from '@interfaces/access-requests.interface';

class AccessRequestService {
  public accessRequests = accessRequestsModel;

  public saveAccessRequest(accessRequest: AccessRequest, ipAddress: string): Promise<AccessRequest> {
    if (isEmpty(accessRequest)) throw new HttpException(400, 'Request data is empty');

    accessRequest.ip = ipAddress;
    return this.accessRequests.create(accessRequest);
  }
}

export default AccessRequestService;
