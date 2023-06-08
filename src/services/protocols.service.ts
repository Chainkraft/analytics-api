import { HttpException } from '@exceptions/HttpException';
import { isEmpty } from '@utils/util';
import protocolsModel from '@models/protocols.model';
import { Protocol } from '@interfaces/protocols.interface';
import slug from 'slug';
import { Contract } from '@interfaces/contracts.interface';

class ProtocolService {
  public protocol = protocolsModel;

  public async findAllProtocols(): Promise<Protocol[]> {
    return this.protocol.find();
  }

  public async findProtocolBySlug(slug: string): Promise<Protocol> {
    if (isEmpty(slug)) throw new HttpException(400, 'Name is empty');

    const protocol: Protocol = await this.protocol.findOne({ slug }).populate('token').populate('contracts');
    if (!protocol) throw new HttpException(404, "Protocol doesn't exist");
    return protocol;
  }

  public async findProtocolByContract(contract: Contract): Promise<Protocol> {
    if (contract === undefined) throw new HttpException(400, 'Contract is empty');
    return this.protocol.findOne({ contracts: contract._id });
  }

  public async createOrUpdateProtocol(protocol: Protocol): Promise<Protocol> {
    if (isEmpty(protocol)) throw new HttpException(400, 'Protocol is empty');
    if (isEmpty(protocol._id)) {
      protocol.slug = slug(protocol.name);
    }

    return this.protocol.findOneAndUpdate({ slug: protocol.slug }, protocol, {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    });
  }
}

export default ProtocolService;
