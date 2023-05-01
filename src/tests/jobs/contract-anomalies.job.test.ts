import { ContractAnomaliesJob } from '../../jobs/contract-anomalies.job';
import { Contract, ContractNetwork, ContractProxyType } from '../../interfaces/contracts.interface';
import { providers } from '@config';
import { NotificationContractChangeDataSchema, NotificationSeverity, NotificationType } from '../../interfaces/notifications.interface';

describe('ContractAnomaliesJob', () => {
  let contractAnomaliesJob: ContractAnomaliesJob;
  let contract: Partial<Contract>;
  const getStorageAtMock = jest.fn();
  const findAllContractsMock = jest.fn();
  const createNotificationMock = jest.fn();
  const findTokenByContractMock = jest.fn();

  beforeEach(() => {
    contractAnomaliesJob = new ContractAnomaliesJob();
    contractAnomaliesJob.contractService.findAllContracts = findAllContractsMock;
    contractAnomaliesJob.contractService.contracts.findByIdAndUpdate = jest.fn();
    contractAnomaliesJob.blockchainService.getBlockNumber = jest.fn();
    contractAnomaliesJob.notificationService.createNotification = createNotificationMock;
    contractAnomaliesJob.tokenService.findTokenByContract = findTokenByContractMock;
    providers.get(ContractNetwork.ETH_MAINNET).core.getStorageAt = getStorageAtMock;

    findTokenByContractMock.mockResolvedValue({});
    createNotificationMock.mockResolvedValue({});

    contract = {
      address: '0x1',
      network: ContractNetwork.ETH_MAINNET,
      proxy: {
        type: ContractProxyType.EIP1822,
        implSlot: '0xLOGIC_SLOT',
        adminSlot: '0xADMIN_SLOT',
        implHistory: [{ address: '0xLOGIC_ADDR' }],
        adminHistory: [{ address: '0xADMIN_ADDR' }],
      },
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should detect proxy logic and admin change', async () => {
    findAllContractsMock.mockResolvedValue([contract]);
    getStorageAtMock.mockResolvedValueOnce('0xLOGIC_ADDR_NEW').mockResolvedValueOnce('0xADMIN_ADDR_NEW');

    await contractAnomaliesJob.generateNotifications();

    expect(contract.proxy.implHistory.length).toBe(2);
    expect(contract.proxy.adminHistory.length).toBe(2);
    expect(contract.proxy.implHistory.at(-1).address).toBe('0xLOGIC_ADDR_NEW');
    expect(contract.proxy.adminHistory.at(-1).address).toBe('0xADMIN_ADDR_NEW');

    expect(contractAnomaliesJob.contractService.contracts.findByIdAndUpdate).toHaveBeenCalled();
    expect(contractAnomaliesJob.blockchainService.getBlockNumber).toHaveBeenCalledTimes(2);
    expect(contractAnomaliesJob.notificationService.createNotification).toHaveBeenCalledTimes(2);
    expect(contractAnomaliesJob.tokenService.findTokenByContract).toHaveBeenCalledTimes(2);
    expect(createNotificationMock.mock.calls).toEqual([
      [
        {
          type: NotificationType.CONTRACT_PROXY_IMPL_CHANGE,
          severity: NotificationSeverity.CRITICAL,
          contract: contract,
          token: {},
          data: <NotificationContractChangeDataSchema>{
            network: 'eth-mainnet',
            oldAddress: '0xLOGIC_ADDR',
            newAddress: '0xLOGIC_ADDR_NEW',
          },
        },
      ],
      [
        {
          type: NotificationType.CONTRACT_PROXY_ADMIN_CHANGE,
          severity: NotificationSeverity.CRITICAL,
          contract: contract,
          token: {},
          data: <NotificationContractChangeDataSchema>{
            network: 'eth-mainnet',
            oldAddress: '0xADMIN_ADDR',
            newAddress: '0xADMIN_ADDR_NEW',
          },
        },
      ],
    ]);
  });

  test('should detect proxy logic change', async () => {
    findAllContractsMock.mockResolvedValue([contract]);
    getStorageAtMock.mockResolvedValueOnce('0xLOGIC_ADDR_NEW').mockResolvedValueOnce('0xADMIN_ADDR');

    await contractAnomaliesJob.generateNotifications();

    expect(contract.proxy.implHistory.length).toBe(2);
    expect(contract.proxy.adminHistory.length).toBe(1);
    expect(contract.proxy.implHistory.at(-1).address).toBe('0xLOGIC_ADDR_NEW');
    expect(contract.proxy.adminHistory.at(-1).address).toBe('0xADMIN_ADDR');

    expect(contractAnomaliesJob.contractService.contracts.findByIdAndUpdate).toHaveBeenCalled();
    expect(contractAnomaliesJob.blockchainService.getBlockNumber).toHaveBeenCalledTimes(1);
    expect(contractAnomaliesJob.notificationService.createNotification).toHaveBeenCalledTimes(1);
    expect(contractAnomaliesJob.tokenService.findTokenByContract).toHaveBeenCalledTimes(1);
    expect(createNotificationMock.mock.calls).toEqual([
      [
        {
          type: NotificationType.CONTRACT_PROXY_IMPL_CHANGE,
          severity: NotificationSeverity.CRITICAL,
          contract: contract,
          token: {},
          data: <NotificationContractChangeDataSchema>{
            network: 'eth-mainnet',
            oldAddress: '0xLOGIC_ADDR',
            newAddress: '0xLOGIC_ADDR_NEW',
          },
        },
      ],
    ]);
  });

  test('should detect proxy admin change', async () => {
    findAllContractsMock.mockResolvedValue([contract]);
    getStorageAtMock.mockRejectedValueOnce('').mockResolvedValueOnce('0xADMIN_ADDR_NEW');

    await contractAnomaliesJob.generateNotifications();

    expect(contract.proxy.implHistory.length).toBe(1);
    expect(contract.proxy.adminHistory.length).toBe(2);
    expect(contract.proxy.implHistory.at(-1).address).toBe('0xLOGIC_ADDR');
    expect(contract.proxy.adminHistory.at(-1).address).toBe('0xADMIN_ADDR_NEW');

    expect(contractAnomaliesJob.contractService.contracts.findByIdAndUpdate).toHaveBeenCalled();
    expect(contractAnomaliesJob.blockchainService.getBlockNumber).toHaveBeenCalledTimes(1);
    expect(contractAnomaliesJob.notificationService.createNotification).toHaveBeenCalledTimes(1);
    expect(contractAnomaliesJob.tokenService.findTokenByContract).toHaveBeenCalledTimes(1);
    expect(createNotificationMock.mock.calls).toEqual([
      [
        {
          type: NotificationType.CONTRACT_PROXY_ADMIN_CHANGE,
          severity: NotificationSeverity.CRITICAL,
          contract: contract,
          token: {},
          data: <NotificationContractChangeDataSchema>{
            network: 'eth-mainnet',
            oldAddress: '0xADMIN_ADDR',
            newAddress: '0xADMIN_ADDR_NEW',
          },
        },
      ],
    ]);
  });
});
