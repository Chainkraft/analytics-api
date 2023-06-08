import { Contract, ContractMonitorType, ContractNetwork, ContractProxyType } from '../../interfaces/contracts.interface';
import ContractService from '../../services/contracts.service';
import R from 'ramda';

describe('ContractService', () => {
  const service = new ContractService();

  test('is a proxy contract', async () => {
    const result = service.isProxyContract(testContract);

    expect(result).toBeTruthy();
  });

  test('is not a proxy contract', async () => {
    const contract = R.clone(testContract);
    contract.proxy = undefined;
    const result = service.isProxyContract(contract);

    expect(result).toBeFalsy();
  });

  test('proxy contract has not changed', async () => {
    const result = service.hasProxyContractChanged(testContract);

    expect(result).toBeFalsy();
  });

  test('proxy contract impl has changed', async () => {
    const contract = R.clone(testContract);
    contract.proxy.implHistory[0].createdByBlock = 1;
    contract.proxy.implHistory[0].createdByBlockAt = getSubtractedDate(ContractService.PROXY_CONTRACT_CHANGE_DAY_SPAN - 10);

    const result = service.hasProxyContractChanged(contract);

    expect(result).toBeTruthy();
  });

  test('proxy contract admin has changed', async () => {
    const contract = R.clone(testContract);
    contract.proxy.adminHistory[0].createdByBlock = 1;
    contract.proxy.adminHistory[0].createdByBlockAt = getSubtractedDate(ContractService.PROXY_CONTRACT_CHANGE_DAY_SPAN - 10);

    const result = service.hasProxyContractChanged(contract);

    expect(result).toBeTruthy();
  });

  test('has proxy contract impl changed in the last THREE months', async () => {
    const contract = R.clone(testContract);
    contract.proxy.implHistory[0].createdByBlock = 1;
    contract.proxy.implHistory[0].createdByBlockAt = getSubtractedDate(ContractService.PROXY_CONTRACT_CHANGE_DAY_SPAN);

    const result = service.hasProxyContractChanged(contract);

    expect(result).toBeFalsy();
  });

  const testContract: Contract = {
    monitorType: ContractMonitorType.PULL,

    address: '',
    network: ContractNetwork.ETH_GOERLI,
    byteCode: '',

    createdByArgs: '',
    createdByBlock: 0,
    createdByBlockAt: new Date(),
    createdByTxHash: '',
    createdByAddress: '',

    verified: false,
    verifiedAbi: '',
    verifiedName: '',
    verifiedSourceCode: '',
    verifiedCompilerVersion: '',

    proxy: {
      type: ContractProxyType.EIP1822,
      implSlot: '',
      adminSlot: '',
      implHistory: [
        {
          createdByBlock: 0,
          address: '',
        },
      ],
      adminHistory: [
        {
          createdByBlock: 0,
          address: '',
        },
      ],
    },
  };

  const getSubtractedDate = (subtractDays: number) => {
    const date = new Date();
    date.setTime(Date.now() - 24 * 60 * 60 * 1000 * subtractDays);
    return date;
  };
});
