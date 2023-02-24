import { Contract, ContractNetwork, ContractProxyType } from '../../interfaces/contracts.interface';
import ContractService from '../../services/contracts.service';
import R from 'ramda';

describe('Testing ContractService', () => {
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
    contract.proxy.implHistory[0].createdAt = getSubtractedDate(10);

    const result = service.hasProxyContractChanged(contract);

    expect(result).toBeTruthy();
  });

  test('proxy contract admin has changed', async () => {
    const contract = R.clone(testContract);
    contract.proxy.adminHistory[0].createdAt = getSubtractedDate(10);

    const result = service.hasProxyContractChanged(contract);

    expect(result).toBeTruthy();
  });

  test('has proxy contract impl changed in the last TWO months', async () => {
    const contract = R.clone(testContract);
    contract.proxy.implHistory[0].createdAt = getSubtractedDate(60);

    const result = service.hasProxyContractChanged(contract);

    expect(result).toBeFalsy();
  });

  const testContract: Contract = {
    address: '',
    network: ContractNetwork.ETH_GOERLI,
    byteCode: '',

    createdByArgs: '',
    createdByBlock: 0,
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
          address: '',
        },
      ],
      adminHistory: [
        {
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
