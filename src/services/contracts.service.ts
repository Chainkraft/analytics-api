import { HttpException } from '@exceptions/HttpException';
import { isEmpty } from '@utils/util';
import contractsModel from '@models/contracts.model';
import { Contract, ContractNetwork, ContractProxyHistory, ContractProxyType } from '@interfaces/contracts.interface';
import ProxyOpcode from '@services/opcode/proxy.opcode';
import { etherscans, providers } from '@config';
import { getFulfilled, isFulfilled, isRejected } from '@utils/typeguard';
import { ObjectId } from 'mongoose';

class ContractService {
  public contracts = contractsModel;

  public async findAllContracts(): Promise<Contract[]> {
    return this.contracts.find();
  }

  public async findAllContractsByNetwork(network: ContractNetwork): Promise<Contract[]> {
    if (isEmpty(network)) throw new HttpException(400, 'Network is empty');
    return this.contracts.find({ network });
  }

  public async findContractsByNetwork(addresses: string[], network: ContractNetwork): Promise<Contract[]> {
    if (isEmpty(network)) throw new HttpException(400, 'Network is empty');
    return this.contracts.find({ address: { $in: addresses }, network });
  }

  public async findContractsByProject(projectId: ObjectId): Promise<Contract[]> {
    if (projectId === undefined) throw new HttpException(400, 'Project is empty');
    return this.contracts.find({ project: projectId });
  }

  public async findContract(address: string, network: ContractNetwork): Promise<Contract> {
    if (isEmpty(address) || isEmpty(network)) throw new HttpException(400, 'Address is empty');
    return this.contracts.findOne({ address, network });
  }

  public async createContract(contract: Contract): Promise<Contract> {
    if (isEmpty(contract)) throw new HttpException(400, 'Contract is empty');

    const findContract: Contract = await this.contracts.findOne({ address: contract.address });
    if (findContract) throw new HttpException(409, `This contract ${contract.address} already exists`);

    return await this.contracts.create(contract);
  }

  public async fetchContractDetails(address: string, network: ContractNetwork): Promise<Contract> {
    const provider = providers.get(network);
    const etherscan = etherscans.get(network);
    const getByteCode = provider.core.getCode(address);
    const getTransactions = etherscan.account.txlist(address, 1, 'latest', 1, 1, 'asc');
    const getVerifiedCode = etherscan.contract.getsourcecode(address);
    const [byteCode, transactions, verifiedCode] = await Promise.allSettled([getByteCode, getTransactions, getVerifiedCode]);
    if (isRejected(byteCode) || isRejected(transactions)) {
      throw new HttpException(400, 'Could not get contract details');
    }

    const proxyOpcode = new ProxyOpcode(byteCode.value);
    const initTransaction = transactions.value.result[0];
    const verifiedContractItem = getFulfilled(verifiedCode)?.value?.result[0];
    const isVerified = verifiedContractItem !== undefined && !!verifiedContractItem.SourceCode;

    const getProxyImpl = provider.core.getStorageAt(address, proxyOpcode.getProxyImplSlot());
    const getProxyAdmin = provider.core.getStorageAt(address, proxyOpcode.getProxyAdminSlot());
    const [proxyImpl, proxyAdmin] = await Promise.allSettled([getProxyImpl, getProxyAdmin]);

    const contract: Contract = {
      address,
      network,
      byteCode: byteCode.value,

      createdByArgs: isVerified ? verifiedContractItem.ConstructorArguments : undefined,
      createdByBlock: initTransaction.blockNumber,
      createdByBlockAt: new Date(initTransaction.timeStamp * 1000),
      createdByTxHash: initTransaction.hash,
      createdByAddress: initTransaction.from,

      verified: isVerified,
      verifiedAbi: isVerified ? verifiedContractItem.ABI : undefined,
      verifiedName: isVerified ? verifiedContractItem.ContractName : undefined,
      verifiedSourceCode: isVerified ? verifiedContractItem.SourceCode : undefined,
      verifiedCompilerVersion: isVerified ? verifiedContractItem.CompilerVersion : undefined,
    };

    if (proxyOpcode.isProxyContract()) {
      contract.proxy = {
        type: proxyOpcode.getProxyType() as ContractProxyType,
        implSlot: proxyOpcode.getProxyImplSlot(),
        adminSlot: proxyOpcode.getProxyAdminSlot(),
        implHistory: [{
          createdByBlock: contract.createdByBlock,
          createdByBlockAt: contract.createdByBlockAt,
          address: getFulfilled(proxyImpl).value
        }],
        adminHistory: [{
          createdByBlock: contract.createdByBlock,
          createdByBlockAt: contract.createdByBlockAt,
          address: getFulfilled(proxyAdmin).value
        }],
      };
    }

    return contract;
  }

  public isProxyContract(contract: Contract): boolean {
    return contract.proxy !== undefined;
  }

  public hasProxyContractChanged(contract: Contract, days = 90): boolean {
    if (this.isProxyContract(contract)) {
      const lastChange = this.getProxyContractChangedRecord(contract);
      if (lastChange !== undefined && lastChange.createdByBlockAt !== undefined) {
        return Number(new Date()) - Number(lastChange.createdByBlockAt) < days * 86_400_000;
      }
    }
    return false;
  }

  public getProxyContractChangedRecord(contract: Contract): ContractProxyHistory {
    if (!this.isProxyContract(contract)) {
      return undefined;
    }
    const lastModifiedProxy = contract.proxy.implHistory.at(-1);
    const lastModifiedAdmin = contract.proxy.adminHistory.at(-1);
    if (lastModifiedProxy === undefined) {
      return lastModifiedAdmin;
    }
    if (lastModifiedAdmin === undefined) {
      return lastModifiedProxy;
    }

    return lastModifiedProxy.createdByBlock > lastModifiedAdmin.createdByBlock ? lastModifiedProxy : lastModifiedAdmin;
  }
}

export default ContractService;
