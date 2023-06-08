import { ContractMonitorType, ContractNetwork } from '@interfaces/contracts.interface';
import { Protocol } from '@interfaces/protocols.interface';

export const PROXY_CONTRACTS: ProtocolContracts[] = [
  {
    protocol: {
      _id: undefined,
      slug: undefined,
      name: 'Chainkraft Proxy',
      description: 'Chainkraft test contract.',
      image: '',
      homeUrl: 'https://chainkraft.com',
      repositoryUrl: '',
      contracts: [],
    },
    contracts: [
      {
        address: '0xCE89E0DA2740e640cfe374C20CF0f3928cb6d265',
        network: ContractNetwork.ETH_GOERLI,
        monitorType: ContractMonitorType.WEBHOOK,
      },
    ],
  },
  {
    protocol: {
      _id: undefined,
      slug: undefined,
      name: 'Paxos Gold',
      description:
        'Paxos Gold (PAXG) is a blockchain-based stablecoin that is fully backed and redeemable for physical gold, ' +
        'providing users with the benefits of real gold ownership and the speed and mobility of a digital asset.',
      image: '',
      homeUrl: 'https://paxos.com/paxgold/',
      repositoryUrl: '',
      contracts: [],
    },
    contracts: [
      {
        address: '0x45804880de22913dafe09f4980848ece6ecbaf78',
        network: ContractNetwork.ETH_MAINNET,
        monitorType: ContractMonitorType.PULL,
      },
      {
        address: '0x553d3d295e0f695b9228246232edf400ed3560b5',
        network: ContractNetwork.MATIC_MAINNET,
        monitorType: ContractMonitorType.WEBHOOK,
      },
      {
        address: '0xfeb4dfc8c4cf7ed305bb08065d08ec6ee6728429',
        network: ContractNetwork.ARB_MAINNET,
        monitorType: ContractMonitorType.WEBHOOK,
      },
    ],
  },
  // {
  //   project: {
  //     _id: undefined,
  //     slug: undefined,
  //     name: 'Binance USD',
  //     description:
  //       'BUSD is a stablecoin pegged to the US Dollar (USD), issued by Paxos. Approved by the NYDFS, BUSD is available for purchase and redemption at a rate of 1 BUSD to 1 USD.',
  //     url: 'https://www.binance.com/en/busd',
  //     logo: '',
  //     contracts: [],
  //   },
  //   contracts: [
  //     {
  //       address: '0x4Fabb145d64652a948d72533023f6E7A623C7C53',
  //       network: ContractNetwork.ETH_MAINNET,
  //     },
  //   ],
  // },
  // {
  //   project: {
  //     name: 'USD Coin',
  //     description:
  //       'USD Coin (USDC) is an Ethereum ERC-20, Algorand ASA, Avalanche ERC-20, Flow FT, Hedera SDK, Solana SPL, Stellar asset, and TRON TRC-20 stablecoin brought to you by Circle and Coinbase. It is issued by regulated and licensed financial institutions that maintain full reserves of the equivalent fiat currency.',
  //     url: 'https://www.centre.io/usdc',
  //     logo: '',
  //     contracts: [],
  //   },
  //   contracts: [
  //     {
  //       address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  //       network: ContractNetwork.ETH_MAINNET,
  //     },
  //   ],
  // },
  // {
  //   project: {
  //     name: 'Lido Staked Ether',
  //     description:
  //       'Lido is a liquid staking solution for ETH 2.0. Lido lets users stake their ETH - without locking assets or maintaining infrastructure - whilst participating in on-chain activities, e.g. lending.',
  //     url: 'https://stake.lido.fi/',
  //     logo: '',
  //     contracts: [],
  //   },
  //   contracts: [
  //     {
  //       address: '0xae7ab96520de3a18e5e111b5eaab095312d7fe84',
  //       network: ContractNetwork.ETH_MAINNET,
  //     },
  //   ],
  // },
  // {
  //   project: {
  //     name: 'OKB Coin',
  //     description: 'The global utility token issued by OK Blockchain Foundation.',
  //     url: 'https://www.okx.com/',
  //     logo: '',
  //     contracts: [],
  //   },
  //   contracts: [
  //     {
  //       address: '0x75231F58b43240C9718Dd58B4967c5114342a86c',
  //       network: ContractNetwork.ETH_MAINNET,
  //     },
  //   ],
  // },
  // {
  //   project: {
  //     name: 'Aave',
  //     description:
  //       'Aave is a decentralized non-custodial liquidity protocol where users can participate as depositors or borrowers. Depositors provide liquidity to the market to earn a passive income, while borrowers are able to borrow in an overcollateralized (perpetually) or undercollateralized (one-block liquidity) fashion.',
  //     url: 'https://aave.com/',
  //     logo: '',
  //     contracts: [],
  //   },
  //   contracts: [
  //     {
  //       address: '0x4da27a545c0c5b758a6ba100e3a049001de870f5', // Staked AAVE
  //       network: ContractNetwork.ETH_MAINNET,
  //     },
  //     {
  //       address: '0xa1116930326d21fb917d5a27f1e9943a9595fb47', // Staked Balancer LP
  //       network: ContractNetwork.ETH_MAINNET,
  //     },
  //     {
  //       address: '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9', // AAVE token
  //       network: ContractNetwork.ETH_MAINNET,
  //     },
  //     {
  //       address: '0x41A08648C3766F9F9d85598fF102a08f4ef84F84', // ABPT token
  //       network: ContractNetwork.ETH_MAINNET,
  //     },
  //   ],
  // },
  // {
  //   project: {
  //     name: 'Tether',
  //     description:
  //       '',
  //     url: 'https://tether.to/',
  //     logo: '',
  //     contracts: [],
  //   },
  //   contracts: [
  //     {
  //       address: '0xdac17f958d2ee523a2206206994597c13d831ec7', // USDT
  //       network: ContractNetwork.ETH_MAINNET,
  //     },
  //     {
  //       address: '0xC581b735A1688071A1746c968e0798D642EDE491', // EURT
  //       network: ContractNetwork.ETH_MAINNET,
  //     },
  //     {
  //       address: '0x6e109e9dd7fa1a58bc3eff667e8e41fc3cc07aef', // CNHT
  //       network: ContractNetwork.ETH_MAINNET,
  //     },
  //   ],
  // },
  // {
  //   project: {
  //     name: 'DAI',
  //     description:
  //       '',
  //     url: 'https://makerdao.com',
  //     logo: '',
  //     contracts: [],
  //   },
  //   contracts: [
  //     {
  //       address: '0x6b175474e89094c44da98b954eedeac495271d0f', // DAI
  //       network: ContractNetwork.ETH_MAINNET,
  //     }
  //   ],
  // },
];

export interface ProtocolContracts {
  protocol: Protocol;
  contracts: ProjectContract[];
}

export interface ProjectContract {
  address: string;
  network: ContractNetwork;
  monitorType: ContractMonitorType;
}
