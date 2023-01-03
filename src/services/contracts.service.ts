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
    return this.contracts.find({ address: { '$in': addresses }, network });
  }

  public async findContractsByProject(projectId: ObjectId): Promise<Contract[]> {
    if (projectId === undefined) throw new HttpException(400, 'Project is empty');
    return this.contracts.find({ 'project': projectId });
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

    const contract: Contract = {
      address,
      network,
      byteCode: byteCode.value,

      createdByArgs: verifiedContractItem?.ConstructorArguments,
      createdByBlock: initTransaction.blockNumber,
      createdByTxHash: initTransaction.hash,
      createdByAddress: initTransaction.from,

      verified: isFulfilled(verifiedCode),
      verifiedAbi: verifiedContractItem?.ABI.replace('Contract source code not verified', ''),
      verifiedName: verifiedContractItem?.ContractName,
      verifiedSourceCode: verifiedContractItem?.SourceCode,
      verifiedCompilerVersion: verifiedContractItem?.CompilerVersion,
    };

    if(proxyOpcode.isProxyContract()) {
      contract.proxy = {
        type: proxyOpcode.getProxyType() as ContractProxyType,
          implSlot: proxyOpcode.getProxyImplSlot(),
          adminSlot: proxyOpcode.getProxyAdminSlot(),
          implHistory: proxyOpcode.getProxyImplSlot()
            ? [{ address: await provider.core.getStorageAt(address, proxyOpcode.getProxyImplSlot()) }]
            : [],
          adminHistory: proxyOpcode.getProxyAdminSlot()
            ? [{ address: await provider.core.getStorageAt(address, proxyOpcode.getProxyAdminSlot()) }]
            : []
      };
    }

    return contract;
  }

  public isProxyContract(contract: Contract): boolean {
    return contract.proxy !== undefined;
  }

  public hasProxyContractChanged(contract: Contract): boolean {
    if(this.isProxyContract(contract)) {
      const currentProxyImpl = contract.proxy.implHistory.at(-1);
      const currentProxyAdmin = contract.proxy.adminHistory.at(-1);
      const hasValueChangedInTheLastMonth = (history: ContractProxyHistory) => {
        if(history !== undefined && history.createdAt !== undefined) {
          return Number(new Date()) - Number(history.createdAt) < 2628288000;
        }
        return false;
      };

      return hasValueChangedInTheLastMonth(currentProxyImpl) || hasValueChangedInTheLastMonth(currentProxyAdmin);
    }
    return false;
  }
}

export default ContractService;
