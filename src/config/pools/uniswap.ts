import { ShortLiquidityPool } from '@/interfaces/liquidity-pool-history.interface';

const uniswapTokenAddresses: string[] = [
  '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', // USDC
  '0x6b175474e89094c44da98b954eedeac495271d0f', // DAI
  '0xdac17f958d2ee523a2206206994597c13d831ec7', // Tether
  '0x853d955acef822db058eb8505911ed77f175b99e', // FRAX
  '0x5f98805a4e8be255a32880fdec7f6728c6568ba0', // LUSD
  '0x0000000000085d4780b73119b644ae5ecd22b376', // TUSD
  '0x0c10bf8fcb7bf5412187a595ab97a3609160b5c6', // USDD
  '0x956f47f50a910163d8bf957cf5846d573e7f87ca', // FEI
];

export const uniswapPools: ShortLiquidityPool[] = [
  // USDC
  {
    name: 'Uniswap DAI/USDC',
    address: '0x5777d92f208679db4b9778590fa3cab3ac9e2168',
    dex: 'uniswap',
  },
  {
    name: 'Uniswap DAI/USDC',
    address: '0x6c6bc977e13df9b0de53b251522280bb72383700',
    dex: 'uniswap',
  },
  {
    name: 'Uniswap USDC/USDT',
    address: '0x3416cf6c708da44db2624d63ea0aaef7113527c6',
    dex: 'uniswap',
  },
  {
    name: 'Uniswap USDC/USDT',
    address: '0x7858e59e0c01ea06df3af3d20ac7b0003275d4bf',
    dex: 'uniswap',
  },
  {
    name: 'Uniswap USDC/TUSD',
    address: '0x39529e96c28807655b5856b3d342c6225111770e',
    dex: 'uniswap',
  },
  {
    name: 'Uniswap USDC/FEI',
    address: '0x8c54aa2a32a779e6f6fbea568ad85a19e0109c26',
    dex: 'uniswap',
  },
  {
    name: 'Uniswap USDC/FEI',
    address: '0x5180545835bd68810fb7e11c7160bb7ea4ae8744',
    dex: 'uniswap',
  },

  // DAI
  {
    name: 'Uniswap DAI/FRAX',
    address: '0x97e7d56a0408570ba1a7852de36350f7713906ec',
    dex: 'uniswap',
  },
  {
    name: 'Uniswap DAI/USDT',
    address: '0x48da0965ab2d2cbf1c17c09cfb5cbe67ad5b1406',
    dex: 'uniswap',
  },

  {
    name: 'Uniswap DAI/USDT',
    address: '0x6f48eca74b38d2936b02ab603ff4e36a6c0e3a77',
    dex: 'uniswap',
  },

  // TETHER

  //FRAX
  {
    name: 'Uniswap USDC/FRAX',
    address: '0xc63b0708e2f7e69cb8a1df0e1389a98c35a76d52',
    dex: 'uniswap',
  },
  {
    name: 'Uniswap USDT/FRAX',
    address: '0xc2a856c3aff2110c1171b8f942256d40e980c726',
    dex: 'uniswap',
  },
  {
    name: 'Uniswap USDC/FRAX',
    address: '0x9a834b70c07c81a9fcd6f22e842bf002fbffbe4d',
    dex: 'uniswap',
  },

  // LUSD
  {
    name: 'Uniswap USDC/LUSD',
    address: '0x4e0924d3a751be199c426d52fb1f2337fa96f736',
    dex: 'uniswap',
  },
  {
    name: 'Uniswap USDC/LUSD',
    address: '0x9902affdd3b8ef60304958c60377110c6d6ab1df',
    dex: 'uniswap',
  },

  //TUSD

  //USDD
  {
    name: 'Uniswap USDC/USDD',
    address: '0x1c5c60bef00c820274d4938a5e6d04b124d4910b',
    dex: 'uniswap',
  },
  {
    name: 'Uniswap USDT/USDD',
    address: '0x2bc477c7c00511ec8a2ea667dd8210af9ff15e1d',
    dex: 'uniswap',
  },

  // MIM
  {
    name: 'Uniswap USDC/MIM',
    address: '0x298b7c5e0770d151e4c5cf6cca4dae3a3ffc8e27',
    dex: 'uniswap',
  },

  //GUSD
  {
    name: 'Uniswap USDC/GUSD',
    address: '0x5aa1356999821b533ec5d9f79c23b8cb7c295c61',
    dex: 'uniswap',
  },

  //BUSD
  {
    name: 'Uniswap BUSD/USDC',
    address: '0x5e35c4eba72470ee1177dcb14dddf4d9e6d915f4',
    dex: 'uniswap',
  },
  {
    name: 'Uniswap BUSD/USDT',
    address: '0xc66e3c356be06b344508392fefb9bc658825035d',
    dex: 'uniswap',
  },

  //OUSD

  {
    name: 'Uniswap OUSD/USDT',
    address: '0x129360c964e2e13910d603043f6287e5e9383374',
    dex: 'uniswap',
  },

  // DOLA

  {
    name: 'Uniswap DOLA/USDC',
    address: '0x7c082bf85e01f9bb343dbb460a14e51f67c58cfb',
    dex: 'uniswap',
  },

  // RSV
  {
    name: 'Uniswap RSV/USDC',
    address: '0x98a19d4954b433bd315335a05d7d6371d812a492',
    dex: 'uniswap',
  },

  // BOB
  {
    name: 'Uniswap USDC/BOB',
    address: '0xc0d19f4fae83eb51b2adb59eb649c7bc2b19b2f6',
    dex: 'uniswap',
  },
  {
    name: 'Uniswap USDC/BOB',
    address: '0x8fb60298c6bbafa428494fd2d63d116063ef32e2',
    dex: 'uniswap',
  },
  {
    name: 'Uniswap USDT/BOB',
    address: '0x0230ddd838e499865405042560e72aa38324acd1',
    dex: 'uniswap',
  },

  // USDS
  // {
  //   name: 'Uniswap USDC/USDS',
  //   address: '0xe749598cb821d45a0c2cad7332cfb3b86a5d7fa3',
  //   dex: 'uniswap',
  // },

  // XAI

  {
    name: 'Uniswap USDC/XAI',
    address: '0x55bb9904df17f3b07551aa117841b3bbfc66646d',
    dex: 'uniswap',
  },
];
