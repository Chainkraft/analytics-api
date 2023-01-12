export interface StablecoinLiquidityPoolSummary {
  tokenSymbol: string;
  tokenSlug: string;
  pools: ShortLiquidityPool[];
}

export interface ShortLiquidityPool {
  name: string;
  symbol: string;
  address: string;
  dex: string;
  tvl?: number;
}

export const stablePools: StablecoinLiquidityPoolSummary[] = [
  {
    tokenSymbol: 'USDT',
    tokenSlug: 'tether',
    pools: [
      {
        symbol: '3Crv',
        name: 'Curve.fi DAI/USDC/USDT',
        dex: 'curve',
        address: '0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7',
      },
      {
        symbol: 'crvPlain3andSUSD',
        name: 'Curve.fi DAI/USDC/USDT/sUSD',
        dex: 'curve',
        address: '0xA5407eAE9Ba41422680e2e00537571bcC53efBfD',
      },
      {
        symbol: 'cDAI+cUSDC+USDT',
        name: 'Curve.fi cDAI/cUSDC/USDT',
        dex: 'curve',
        address: '0x52EA46506B9CC5Ef470C5bf89f17Dc28bB35D85C',
      },
      {
        symbol: 'crvTricrypto',
        name: 'Curve.fi USD-BTC-ETH',
        dex: 'curve',
        address: '0x80466c64868E1ab14a1Ddf27A676C3fcBE638Fe5',
      },
      // {
      //   symbol: null,
      //   name: null,
      //   address: "0x4e0915C88bC70750D68C481540F081fEFaF22273"
      // },
      // {
      //   symbol: null,
      //   name: null,
      //   address: "0x1005F7406f32a61BD760CfA14aCCd2737913d546"
      // }

      // factory pools
      {
        symbol: 'dusd3CRV',
        name: 'Curve.fi DUSD/3Crv',
        dex: 'curve',
        address: '0x8038C01A0390a8c547446a0b2c18fc9aEFEcc10c',
      },
      {
        symbol: 'gusd3CRV',
        name: 'Curve.fi GUSD/3Crv',
        dex: 'curve',
        address: '0x4f062658EaAF2C1ccf8C8e36D6824CDf41167956',
      },
      {
        symbol: 'husd3CRV',
        name: 'Curve.fi HUSD/3Crv',
        dex: 'curve',
        address: '0x3eF6A01A0f81D6046290f3e2A8c5b843e738E604',
      },
      {
        symbol: 'LinkUSD3CRV',
        name: 'Curve.fi LinkUSD/3Crv',
        dex: 'curve',
        address: '0xE7a24EF0C5e95Ffb0f6684b813A78F2a3AD7D171',
      },
      {
        symbol: 'musd3CRV',
        name: 'Curve.fi MUSD/3Crv',
        dex: 'curve',
        address: '0x8474DdbE98F5aA3179B3B3F5942D724aFcdec9f6',
      },
      {
        symbol: 'rsv3CRV',
        name: 'Curve.fi RSV/3Crv',
        dex: 'curve',
        address: '0xC18cC39da8b11dA8c3541C598eE022258F9744da',
      },
      {
        symbol: 'usdk3CRV',
        name: 'Curve.fi USDK/3Crv',
        dex: 'curve',
        address: '0x3E01dD8a5E1fb3481F0F589056b428Fc308AF0Fb',
      },
      {
        symbol: 'usdn3CRV',
        name: 'Curve.fi USDN/3Crv',
        dex: 'curve',
        address: '0x0f9cb53Ebe405d49A0bbdBD291A65Ff571bC83e1',
      },
      {
        symbol: 'usdp3CRV',
        name: 'Curve.fi USDP/3Crv',
        dex: 'curve',
        address: '0x42d7025938bEc20B69cBae5A77421082407f053A',
      },
      {
        symbol: 'ust3CRV',
        name: 'Curve.fi UST/3Crv',
        dex: 'curve',
        address: '0x890f4e345B1dAED0367A877a1612f86A1f86985f',
      },
      {
        symbol: 'tusd3CRV',
        name: 'Curve.fi TUSD/3Crv',
        dex: 'curve',
        address: '0xEcd5e75AFb02eFa118AF914515D6521aaBd189F1',
      },
      {
        symbol: 'lusd3CRV',
        name: 'Curve.fi LUSD/3Crv',
        dex: 'curve',
        address: '0xEd279fDD11cA84bEef15AF5D39BB4d4bEE23F0cA',
      },
      {
        symbol: 'frax3CRV',
        name: 'Curve.fi FRAX/3Crv',
        dex: 'curve',
        address: '0xd632f22692FaC7611d2AA1C0D552930D43CAEd3B',
      },
      {
        symbol: 'busdv2',
        name: 'Curve.fi: BUSD V2',
        dex: 'curve',
        address: '0x4807862AA8b2bF68830e4C8dc86D0e9A998e085a',
      },
      {
        symbol: 'alusd3CRV',
        name: 'Curve.fi: alUSD Factory Pool',
        dex: 'curve',
        address: '0x43b4FdFD4Ff969587185cDB6f0BD875c5Fc83f8c',
      },
      {
        symbol: 'RAI3CRV',
        name: 'RAI3CRV',
        dex: 'curve',
        address: '0x618788357D0EBd8A37e763ADab3bc575D54c2C7d',
      },
      {
        symbol: 'mim3CRV',
        name: 'Curve.fi MIM/3Crv',
        dex: 'curve',
        address: '0x5a6A4D54456819380173272A5E8E9B9904BdF41B',
      },
    ],
  },
  {
    tokenSymbol: 'USDC',
    tokenSlug: 'usd-coin',
    pools: [
      {
        symbol: '3Crv',
        name: 'Curve.fi DAI/USDC/USDT',
        address: '0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7',
        dex: 'curve',
      },
      {
        symbol: 'crvPlain3andSUSD',
        name: 'Curve.fi DAI/USDC/USDT/sUSD',
        address: '0xA5407eAE9Ba41422680e2e00537571bcC53efBfD',
        dex: 'curve',
      },
      {
        symbol: null,
        name: null,
        address: '0x4e0915C88bC70750D68C481540F081fEFaF22273',
        dex: 'curve',
      },
      {
        symbol: null,
        name: null,
        address: '0x1005F7406f32a61BD760CfA14aCCd2737913d546',
        dex: 'curve',
      },
      {
        symbol: 'crvFRAX',
        name: 'Curve.fi FRAX/USDC',
        address: '0xDcEF968d416a41Cdac0ED8702fAC8128A64241A2',
        dex: 'curve',
      },
      {
        symbol: 'dusd3CRV',
        name: 'Curve.fi DUSD/3Crv',
        address: '0x8038C01A0390a8c547446a0b2c18fc9aEFEcc10c',
        dex: 'curve',
      },
      {
        symbol: 'gusd3CRV',
        name: 'Curve.fi GUSD/3Crv',
        address: '0x4f062658EaAF2C1ccf8C8e36D6824CDf41167956',
        dex: 'curve',
      },
      {
        symbol: 'husd3CRV',
        name: 'Curve.fi HUSD/3Crv',
        address: '0x3eF6A01A0f81D6046290f3e2A8c5b843e738E604',
        dex: 'curve',
      },
      {
        symbol: 'LinkUSD3CRV',
        name: 'Curve.fi LinkUSD/3Crv',
        address: '0xE7a24EF0C5e95Ffb0f6684b813A78F2a3AD7D171',
        dex: 'curve',
      },
      {
        symbol: 'musd3CRV',
        name: 'Curve.fi MUSD/3Crv',
        address: '0x8474DdbE98F5aA3179B3B3F5942D724aFcdec9f6',
        dex: 'curve',
      },
      {
        symbol: 'rsv3CRV',
        name: 'Curve.fi RSV/3Crv',
        address: '0xC18cC39da8b11dA8c3541C598eE022258F9744da',
        dex: 'curve',
      },
      {
        symbol: 'usdk3CRV',
        name: 'Curve.fi USDK/3Crv',
        address: '0x3E01dD8a5E1fb3481F0F589056b428Fc308AF0Fb',
        dex: 'curve',
      },
      {
        symbol: 'usdn3CRV',
        name: 'Curve.fi USDN/3Crv',
        address: '0x0f9cb53Ebe405d49A0bbdBD291A65Ff571bC83e1',
        dex: 'curve',
      },
      {
        symbol: 'usdp3CRV',
        name: 'Curve.fi USDP/3Crv',
        address: '0x42d7025938bEc20B69cBae5A77421082407f053A',
        dex: 'curve',
      },
      {
        symbol: 'ust3CRV',
        name: 'Curve.fi UST/3Crv',
        address: '0x890f4e345B1dAED0367A877a1612f86A1f86985f',
        dex: 'curve',
      },
      {
        symbol: null,
        name: null,
        address: '0xEcd5e75AFb02eFa118AF914515D6521aaBd189F1',
        dex: 'curve',
      },
      {
        symbol: null,
        name: null,
        address: '0xEd279fDD11cA84bEef15AF5D39BB4d4bEE23F0cA',
        dex: 'curve',
      },
      {
        symbol: null,
        name: null,
        address: '0xd632f22692FaC7611d2AA1C0D552930D43CAEd3B',
        dex: 'curve',
      },
      {
        symbol: null,
        name: null,
        address: '0x4807862AA8b2bF68830e4C8dc86D0e9A998e085a',
        dex: 'curve',
      },
      {
        symbol: null,
        name: null,
        address: '0x43b4FdFD4Ff969587185cDB6f0BD875c5Fc83f8c',
        dex: 'curve',
      },
      {
        symbol: 'RAI3CRV',
        name: 'RAI3CRV',
        address: '0x618788357D0EBd8A37e763ADab3bc575D54c2C7d',
        dex: 'curve',
      },
      {
        symbol: null,
        name: null,
        address: '0x5a6A4D54456819380173272A5E8E9B9904BdF41B',
        dex: 'curve',
      },
    ],
  },
  {
    tokenSymbol: 'BUSD',
    tokenSlug: 'binance-usd',
    pools: [
      {
        symbol: 'busdv2',
        name: 'Curve.fi: BUSD V2',
        address: '0x4807862AA8b2bF68830e4C8dc86D0e9A998e085a',
        dex: 'curve',
      },
    ],
  },
  {
    tokenSymbol: 'DAI',
    tokenSlug: 'dai',
    pools: [
      {
        symbol: '3Crv',
        name: 'Curve.fi DAI/USDC/USDT',
        address: '0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7',
        dex: 'curve',
      },
      {
        symbol: 'crvPlain3andSUSD',
        name: 'Curve.fi DAI/USDC/USDT/sUSD',
        address: '0xA5407eAE9Ba41422680e2e00537571bcC53efBfD',
        dex: 'curve',
      },
      {
        symbol: 'dusd3CRV',
        name: 'Curve.fi DUSD/3Crv',
        address: '0x8038C01A0390a8c547446a0b2c18fc9aEFEcc10c',
        dex: 'curve',
      },
      {
        symbol: 'gusd3CRV',
        name: 'Curve.fi GUSD/3Crv',
        address: '0x4f062658EaAF2C1ccf8C8e36D6824CDf41167956',
        dex: 'curve',
      },
      {
        symbol: 'husd3CRV',
        name: 'Curve.fi HUSD/3Crv',
        address: '0x3eF6A01A0f81D6046290f3e2A8c5b843e738E604',
        dex: 'curve',
      },
      {
        symbol: 'LinkUSD3CRV',
        name: 'Curve.fi LinkUSD/3Crv',
        address: '0xE7a24EF0C5e95Ffb0f6684b813A78F2a3AD7D171',
        dex: 'curve',
      },
      {
        symbol: 'musd3CRV',
        name: 'Curve.fi MUSD/3Crv',
        address: '0x8474DdbE98F5aA3179B3B3F5942D724aFcdec9f6',
        dex: 'curve',
      },
      {
        symbol: 'rsv3CRV',
        name: 'Curve.fi RSV/3Crv',
        address: '0xC18cC39da8b11dA8c3541C598eE022258F9744da',
        dex: 'curve',
      },
      {
        symbol: 'usdk3CRV',
        name: 'Curve.fi USDK/3Crv',
        address: '0x3E01dD8a5E1fb3481F0F589056b428Fc308AF0Fb',
        dex: 'curve',
      },
      {
        symbol: 'usdn3CRV',
        name: 'Curve.fi USDN/3Crv',
        address: '0x0f9cb53Ebe405d49A0bbdBD291A65Ff571bC83e1',
        dex: 'curve',
      },
      {
        symbol: 'usdp3CRV',
        name: 'Curve.fi USDP/3Crv',
        address: '0x42d7025938bEc20B69cBae5A77421082407f053A',
        dex: 'curve',
      },
      {
        symbol: 'ust3CRV',
        name: 'Curve.fi UST/3Crv',
        address: '0x890f4e345B1dAED0367A877a1612f86A1f86985f',
        dex: 'curve',
      },
      {
        symbol: null,
        name: null,
        address: '0xEcd5e75AFb02eFa118AF914515D6521aaBd189F1',
        dex: 'curve',
      },
      {
        symbol: null,
        name: null,
        address: '0xEd279fDD11cA84bEef15AF5D39BB4d4bEE23F0cA',
        dex: 'curve',
      },
      {
        symbol: null,
        name: null,
        address: '0xd632f22692FaC7611d2AA1C0D552930D43CAEd3B',
        dex: 'curve',
      },
      {
        symbol: null,
        name: null,
        address: '0x4807862AA8b2bF68830e4C8dc86D0e9A998e085a',
        dex: 'curve',
      },
      {
        symbol: null,
        name: null,
        address: '0x43b4FdFD4Ff969587185cDB6f0BD875c5Fc83f8c',
        dex: 'curve',
      },
      {
        symbol: 'RAI3CRV',
        name: 'RAI3CRV',
        address: '0x618788357D0EBd8A37e763ADab3bc575D54c2C7d',
        dex: 'curve',
      },
      {
        symbol: null,
        name: null,
        address: '0x5a6A4D54456819380173272A5E8E9B9904BdF41B',
        dex: 'curve',
      },
    ],
  },
  {
    tokenSymbol: 'FRAX',
    tokenSlug: 'frax',
    pools: [
      {
        symbol: null,
        name: null,
        address: '0xd632f22692FaC7611d2AA1C0D552930D43CAEd3B',
        dex: 'curve',
      },
      {
        symbol: null,
        name: null,
        address: '0x4e0915C88bC70750D68C481540F081fEFaF22273',
        dex: 'curve',
      },
      {
        symbol: 'crvFRAX',
        name: 'Curve.fi FRAX/USDC',
        address: '0xDcEF968d416a41Cdac0ED8702fAC8128A64241A2',
        dex: 'curve',
      },
    ],
  },
  {
    tokenSymbol: 'USDP',
    tokenSlug: 'pax-dollar',
    pools: [
      {
        symbol: 'usdp3CRV',
        name: 'Curve.fi USDP/3Crv',
        address: '0x42d7025938bEc20B69cBae5A77421082407f053A',
        dex: 'curve',
      },
      {
        symbol: 'ypaxCrv',
        name: 'Curve.fi DAI/USDC/USDT/PAX',
        address: '0x06364f10B501e868329afBc005b3492902d6C763',
        dex: 'curve',
      },
    ],
  },
];
