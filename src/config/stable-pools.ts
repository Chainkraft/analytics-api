export interface StablecoinLiquidityPoolSummary {
  tokenSymbol: string;
  tokenSlug: string;
  pools: ShortLiquidityPool[];
}

export interface ShortLiquidityPool {
  name: string;
  symbol?: string;
  address: string;
  dex: string;
  tvl?: number;
}

export const stablePools: StablecoinLiquidityPoolSummary[] = [
  {
    tokenSymbol: 'DAI',
    tokenSlug: 'dai',
    pools: [
      {
        name: 'Curve.fi DAI/USDC/USDT',
        address: '0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7',
        dex: 'curve',
      },
      {
        name: 'Curve.fi DAI/USDC/USDT/sUSD',
        address: '0xA5407eAE9Ba41422680e2e00537571bcC53efBfD',
        dex: 'curve',
      },
      {
        name: 'Curve.fi DUSD/3Crv',
        address: '0x8038C01A0390a8c547446a0b2c18fc9aEFEcc10c',
        dex: 'curve',
      },
      {
        name: 'Curve.fi GUSD/3Crv',
        address: '0x4f062658EaAF2C1ccf8C8e36D6824CDf41167956',
        dex: 'curve',
      },
      {
        name: 'Curve.fi HUSD/3Crv',
        address: '0x3eF6A01A0f81D6046290f3e2A8c5b843e738E604',
        dex: 'curve',
      },
      {
        name: 'Curve.fi LinkUSD/3Crv',
        address: '0xE7a24EF0C5e95Ffb0f6684b813A78F2a3AD7D171',
        dex: 'curve',
      },
      {
        name: 'Curve.fi MUSD/3Crv',
        address: '0x8474DdbE98F5aA3179B3B3F5942D724aFcdec9f6',
        dex: 'curve',
      },
      {
        name: 'Curve.fi RSV/3Crv',
        address: '0xC18cC39da8b11dA8c3541C598eE022258F9744da',
        dex: 'curve',
      },
      {
        name: 'Curve.fi USDK/3Crv',
        address: '0x3E01dD8a5E1fb3481F0F589056b428Fc308AF0Fb',
        dex: 'curve',
      },
      {
        name: 'Curve.fi USDN/3Crv',
        address: '0x0f9cb53Ebe405d49A0bbdBD291A65Ff571bC83e1',
        dex: 'curve',
      },
      {
        name: 'Curve.fi USDP/3Crv',
        address: '0x42d7025938bEc20B69cBae5A77421082407f053A',
        dex: 'curve',
      },
      {
        name: 'Curve.fi UST/3Crv',
        address: '0x890f4e345B1dAED0367A877a1612f86A1f86985f',
        dex: 'curve',
      },
      {
        name: undefined,
        address: '0xEcd5e75AFb02eFa118AF914515D6521aaBd189F1',
        dex: 'curve',
      },
      {
        name: undefined,
        address: '0xEd279fDD11cA84bEef15AF5D39BB4d4bEE23F0cA',
        dex: 'curve',
      },
      {
        name: undefined,
        address: '0xd632f22692FaC7611d2AA1C0D552930D43CAEd3B',
        dex: 'curve',
      },
      {
        name: undefined,
        address: '0x4807862AA8b2bF68830e4C8dc86D0e9A998e085a',
        dex: 'curve',
      },
      {
        name: undefined,
        address: '0x43b4FdFD4Ff969587185cDB6f0BD875c5Fc83f8c',
        dex: 'curve',
      },
      {
        name: 'RAI3CRV',
        address: '0x618788357D0EBd8A37e763ADab3bc575D54c2C7d',
        dex: 'curve',
      },
      {
        name: undefined,
        address: '0x5a6A4D54456819380173272A5E8E9B9904BdF41B',
        dex: 'curve',
      },
    ],
  },
  {
    tokenSymbol: 'USDC',
    tokenSlug: 'usd-coin',
    pools: [
      {
        name: 'Curve.fi DAI/USDC/USDT',
        address: '0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7',
        dex: 'curve',
      },
      {
        name: 'Curve.fi DAI/USDC/USDT/sUSD',
        address: '0xA5407eAE9Ba41422680e2e00537571bcC53efBfD',
        dex: 'curve',
      },
      {
        name: 'Curve.fi DUSD/3Crv',
        address: '0x8038C01A0390a8c547446a0b2c18fc9aEFEcc10c',
        dex: 'curve',
      },
      {
        name: 'Curve.fi GUSD/3Crv',
        address: '0x4f062658EaAF2C1ccf8C8e36D6824CDf41167956',
        dex: 'curve',
      },
      {
        name: 'Curve.fi HUSD/3Crv',
        address: '0x3eF6A01A0f81D6046290f3e2A8c5b843e738E604',
        dex: 'curve',
      },
      {
        name: 'Curve.fi LinkUSD/3Crv',
        address: '0xE7a24EF0C5e95Ffb0f6684b813A78F2a3AD7D171',
        dex: 'curve',
      },
      {
        name: 'Curve.fi MUSD/3Crv',
        address: '0x8474DdbE98F5aA3179B3B3F5942D724aFcdec9f6',
        dex: 'curve',
      },
      {
        name: 'Curve.fi RSV/3Crv',
        address: '0xC18cC39da8b11dA8c3541C598eE022258F9744da',
        dex: 'curve',
      },
      {
        name: 'Curve.fi USDK/3Crv',
        address: '0x3E01dD8a5E1fb3481F0F589056b428Fc308AF0Fb',
        dex: 'curve',
      },
      {
        name: 'Curve.fi USDN/3Crv',
        address: '0x0f9cb53Ebe405d49A0bbdBD291A65Ff571bC83e1',
        dex: 'curve',
      },
      {
        name: 'Curve.fi USDP/3Crv',
        address: '0x42d7025938bEc20B69cBae5A77421082407f053A',
        dex: 'curve',
      },
      {
        name: 'Curve.fi UST/3Crv',
        address: '0x890f4e345B1dAED0367A877a1612f86A1f86985f',
        dex: 'curve',
      },
      {
        name: undefined,
        address: '0xEcd5e75AFb02eFa118AF914515D6521aaBd189F1',
        dex: 'curve',
      },
      {
        name: undefined,
        address: '0xEd279fDD11cA84bEef15AF5D39BB4d4bEE23F0cA',
        dex: 'curve',
      },
      {
        name: undefined,
        address: '0xd632f22692FaC7611d2AA1C0D552930D43CAEd3B',
        dex: 'curve',
      },
      {
        name: undefined,
        address: '0x4807862AA8b2bF68830e4C8dc86D0e9A998e085a',
        dex: 'curve',
      },
      {
        name: undefined,
        address: '0x43b4FdFD4Ff969587185cDB6f0BD875c5Fc83f8c',
        dex: 'curve',
      },
      {
        name: 'RAI3CRV',
        address: '0x618788357D0EBd8A37e763ADab3bc575D54c2C7d',
        dex: 'curve',
      },
      {
        name: undefined,
        address: '0x5a6A4D54456819380173272A5E8E9B9904BdF41B',
        dex: 'curve',
      },
      {
        name: undefined,
        address: '0x4e0915C88bC70750D68C481540F081fEFaF22273',
        dex: 'curve',
      },
      {
        name: undefined,
        address: '0x1005F7406f32a61BD760CfA14aCCd2737913d546',
        dex: 'curve',
      },
      {
        name: 'Curve.fi FRAX/USDC',
        address: '0xDcEF968d416a41Cdac0ED8702fAC8128A64241A2',
        dex: 'curve',
      },
    ],
  },
  {
    tokenSymbol: 'USDT',
    tokenSlug: 'tether',
    pools: [
      {
        name: 'Curve.fi DAI/USDC/USDT',
        address: '0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7',
        dex: 'curve',
      },
      {
        name: 'Curve.fi DAI/USDC/USDT/sUSD',
        address: '0xA5407eAE9Ba41422680e2e00537571bcC53efBfD',
        dex: 'curve',
      },
      {
        name: 'Curve.fi cDAI/cUSDC/USDT',
        address: '0x52EA46506B9CC5Ef470C5bf89f17Dc28bB35D85C',
        dex: 'curve',
      },
      {
        name: 'Curve.fi DUSD/3Crv',
        address: '0x8038C01A0390a8c547446a0b2c18fc9aEFEcc10c',
        dex: 'curve',
      },
      {
        name: 'Curve.fi GUSD/3Crv',
        address: '0x4f062658EaAF2C1ccf8C8e36D6824CDf41167956',
        dex: 'curve',
      },
      {
        name: 'Curve.fi HUSD/3Crv',
        address: '0x3eF6A01A0f81D6046290f3e2A8c5b843e738E604',
        dex: 'curve',
      },
      {
        name: 'Curve.fi LinkUSD/3Crv',
        address: '0xE7a24EF0C5e95Ffb0f6684b813A78F2a3AD7D171',
        dex: 'curve',
      },
      {
        name: 'Curve.fi MUSD/3Crv',
        address: '0x8474DdbE98F5aA3179B3B3F5942D724aFcdec9f6',
        dex: 'curve',
      },
      {
        name: 'Curve.fi RSV/3Crv',
        address: '0xC18cC39da8b11dA8c3541C598eE022258F9744da',
        dex: 'curve',
      },
      {
        name: 'Curve.fi USDK/3Crv',
        address: '0x3E01dD8a5E1fb3481F0F589056b428Fc308AF0Fb',
        dex: 'curve',
      },
      {
        name: 'Curve.fi USDN/3Crv',
        address: '0x0f9cb53Ebe405d49A0bbdBD291A65Ff571bC83e1',
        dex: 'curve',
      },
      {
        name: 'Curve.fi USDP/3Crv',
        address: '0x42d7025938bEc20B69cBae5A77421082407f053A',
        dex: 'curve',
      },
      {
        name: 'Curve.fi UST/3Crv',
        address: '0x890f4e345B1dAED0367A877a1612f86A1f86985f',
        dex: 'curve',
      },
      {
        name: undefined,
        address: '0xEcd5e75AFb02eFa118AF914515D6521aaBd189F1',
        dex: 'curve',
      },
      {
        name: undefined,
        address: '0xEd279fDD11cA84bEef15AF5D39BB4d4bEE23F0cA',
        dex: 'curve',
      },
      {
        name: undefined,
        address: '0xd632f22692FaC7611d2AA1C0D552930D43CAEd3B',
        dex: 'curve',
      },
      {
        name: undefined,
        address: '0x4807862AA8b2bF68830e4C8dc86D0e9A998e085a',
        dex: 'curve',
      },
      {
        name: undefined,
        address: '0x43b4FdFD4Ff969587185cDB6f0BD875c5Fc83f8c',
        dex: 'curve',
      },
      {
        name: 'Curve.fi USD-BTC-ETH',
        address: '0x80466c64868E1ab14a1Ddf27A676C3fcBE638Fe5',
        dex: 'curve',
      },
      {
        name: 'RAI3CRV',
        address: '0x618788357D0EBd8A37e763ADab3bc575D54c2C7d',
        dex: 'curve',
      },
      {
        name: undefined,
        address: '0x5a6A4D54456819380173272A5E8E9B9904BdF41B',
        dex: 'curve',
      },
      {
        name: undefined,
        address: '0x4e0915C88bC70750D68C481540F081fEFaF22273',
        dex: 'curve',
      },
      {
        name: undefined,
        address: '0x1005F7406f32a61BD760CfA14aCCd2737913d546',
        dex: 'curve',
      },
    ],
  },
  {
    tokenSymbol: 'aDAI',
    tokenSlug: undefined,
    pools: [
      {
        name: 'Curve.fi aDAI/aUSDC/aUSDT',
        address: '0xDeBF20617708857ebe4F679508E7b7863a8A8EeE',
        dex: 'curve',
      },
      {
        name: 'Curve.fi aDAI/aSUSD',
        address: '0xEB16Ae0052ed37f479f7fe63849198Df1765a733',
        dex: 'curve',
      },
    ],
  },
  {
    tokenSymbol: 'aUSDC',
    tokenSlug: undefined,
    pools: [
      {
        name: 'Curve.fi aDAI/aUSDC/aUSDT',
        address: '0xDeBF20617708857ebe4F679508E7b7863a8A8EeE',
        dex: 'curve',
      },
    ],
  },
  {
    tokenSymbol: 'aUSDT',
    tokenSlug: undefined,
    pools: [
      {
        name: 'Curve.fi aDAI/aUSDC/aUSDT',
        address: '0xDeBF20617708857ebe4F679508E7b7863a8A8EeE',
        dex: 'curve',
      },
    ],
  },
  {
    tokenSymbol: 'ETH',
    tokenSlug: undefined,
    pools: [
      {
        name: 'Curve.fi ETH/aETH',
        address: '0xA96A65c051bF88B4095Ee1f2451C2A9d43F53Ae2',
        dex: 'curve',
      },
      {
        name: 'Curve.fi ETH/sETH',
        address: '0xc5424B857f758E906013F3555Dad202e4bdB4567',
        dex: 'curve',
      },
      {
        name: 'Curve.fi ETH/stETH',
        address: '0xDC24316b9AE028F1497c275EB9192a3Ea0f67022',
        dex: 'curve',
      },
      {
        name: 'Curve.fi ETH/rETH',
        address: '0xF9440930043eb3997fc70e1339dBb11F341de7A8',
        dex: 'curve',
      },
      {
        name: 'Curve.fi ETH/frxETH',
        address: '0xa1F8A6807c402E4A15ef4EBa36528A3FED24E577',
        dex: 'curve',
      },
    ],
  },
  {
    tokenSymbol: 'ankrETH',
    tokenSlug: undefined,
    pools: [
      {
        name: 'Curve.fi ETH/aETH',
        address: '0xA96A65c051bF88B4095Ee1f2451C2A9d43F53Ae2',
        dex: 'curve',
      },
    ],
  },
  {
    tokenSymbol: 'yDAI',
    tokenSlug: undefined,
    pools: [
      {
        name: 'Curve.fi yDAI/yUSDC/yUSDT/yBUSD',
        address: '0x79a8C46DeA5aDa233ABaFFD40F3A0A2B1e5A4F27',
        dex: 'curve',
      },
      {
        name: 'Curve.fi yDAI/yUSDC/yUSDT/yTUSD',
        address: '0x45F783CCE6B7FF23B2ab2D70e416cdb7D6055f51',
        dex: 'curve',
      },
    ],
  },
  {
    tokenSymbol: 'yUSDC',
    tokenSlug: undefined,
    pools: [
      {
        name: 'Curve.fi yDAI/yUSDC/yUSDT/yBUSD',
        address: '0x79a8C46DeA5aDa233ABaFFD40F3A0A2B1e5A4F27',
        dex: 'curve',
      },
      {
        name: 'Curve.fi yDAI/yUSDC/yUSDT/yTUSD',
        address: '0x45F783CCE6B7FF23B2ab2D70e416cdb7D6055f51',
        dex: 'curve',
      },
    ],
  },
  {
    tokenSymbol: 'yUSDT',
    tokenSlug: undefined,
    pools: [
      {
        name: 'Curve.fi yDAI/yUSDC/yUSDT/yBUSD',
        address: '0x79a8C46DeA5aDa233ABaFFD40F3A0A2B1e5A4F27',
        dex: 'curve',
      },
      {
        name: 'Curve.fi yDAI/yUSDC/yUSDT/yTUSD',
        address: '0x45F783CCE6B7FF23B2ab2D70e416cdb7D6055f51',
        dex: 'curve',
      },
    ],
  },
  {
    tokenSymbol: 'yBUSD',
    tokenSlug: undefined,
    pools: [
      {
        name: 'Curve.fi yDAI/yUSDC/yUSDT/yBUSD',
        address: '0x79a8C46DeA5aDa233ABaFFD40F3A0A2B1e5A4F27',
        dex: 'curve',
      },
    ],
  },
  {
    tokenSymbol: 'cDAI',
    tokenSlug: undefined,
    pools: [
      {
        name: 'Curve.fi cDAI/cUSDC',
        address: '0xA2B47E3D5c44877cca798226B7B8118F9BFb7A56',
        dex: 'curve',
      },
      {
        name: 'Curve.fi cDAI/cUSDC/USDT',
        address: '0x52EA46506B9CC5Ef470C5bf89f17Dc28bB35D85C',
        dex: 'curve',
      },
    ],
  },
  {
    tokenSymbol: 'cUSDC',
    tokenSlug: undefined,
    pools: [
      {
        name: 'Curve.fi cDAI/cUSDC',
        address: '0xA2B47E3D5c44877cca798226B7B8118F9BFb7A56',
        dex: 'curve',
      },
      {
        name: 'Curve.fi cDAI/cUSDC/USDT',
        address: '0x52EA46506B9CC5Ef470C5bf89f17Dc28bB35D85C',
        dex: 'curve',
      },
    ],
  },
  {
    tokenSymbol: 'EURS',
    tokenSlug: undefined,
    pools: [
      {
        name: 'Curve.fi EURS/sEUR',
        address: '0x0Ce6a5fF5217e38315f87032CF90686C96627CAA',
        dex: 'curve',
      },
    ],
  },
  {
    tokenSymbol: 'sEUR',
    tokenSlug: undefined,
    pools: [
      {
        name: 'Curve.fi EURS/sEUR',
        address: '0x0Ce6a5fF5217e38315f87032CF90686C96627CAA',
        dex: 'curve',
      },
      {
        name: undefined,
        address: '0xFD5dB7463a3aB53fD211b4af195c5BCCC1A03890',
        dex: 'curve',
      },
    ],
  },
  {
    tokenSymbol: 'HBTC',
    tokenSlug: undefined,
    pools: [
      {
        name: 'Curve.fi hBTC/wBTC',
        address: '0x4CA9b3063Ec5866A4B82E437059D2C43d1be596F',
        dex: 'curve',
      },
    ],
  },
  {
    tokenSymbol: 'WBTC',
    tokenSlug: undefined,
    pools: [
      {
        name: 'Curve.fi hBTC/wBTC',
        address: '0x4CA9b3063Ec5866A4B82E437059D2C43d1be596F',
        dex: 'curve',
      },
      {
        name: 'Curve.fi renBTC/wBTC',
        address: '0x93054188d876f558f4a66B2EF1d97d16eDf0895B',
        dex: 'curve',
      },
      {
        name: 'Curve.fi renBTC/wBTC/sBTC',
        address: '0x7fC77b5c7614E1533320Ea6DDc2Eb61fa00A9714',
        dex: 'curve',
      },
      {
        name: 'Curve.fi bBTC/sbtcCRV',
        address: '0x071c661B4DeefB59E2a3DdB20Db036821eeE8F4b',
        dex: 'curve',
      },
      {
        name: 'Curve.fi oBTC/sbtcCRV',
        address: '0xd81dA8D904b52208541Bade1bD6595D8a251F8dd',
        dex: 'curve',
      },
      {
        name: 'Curve.fi pBTC/sbtcCRV',
        address: '0x7F55DDe206dbAD629C080068923b36fe9D6bDBeF',
        dex: 'curve',
      },
      {
        name: 'Curve.fi tBTC/sbtcCrv',
        address: '0xC25099792E9349C7DD09759744ea681C7de2cb66',
        dex: 'curve',
      },
      {
        name: 'Curve.fi USD-BTC-ETH',
        address: '0x80466c64868E1ab14a1Ddf27A676C3fcBE638Fe5',
        dex: 'curve',
      },
      {
        name: 'Curve.fi wBTC/sBTC',
        address: '0xf253f83AcA21aAbD2A20553AE0BF7F65C755A07F',
        dex: 'curve',
      },
    ],
  },
  {
    tokenSymbol: 'iDAI',
    tokenSlug: undefined,
    pools: [
      {
        name: 'Curve.fi cyDAI/cyUSDC/cyUSDT',
        address: '0x2dded6Da1BF5DBdF597C45fcFaa3194e53EcfeAF',
        dex: 'curve',
      },
    ],
  },
  {
    tokenSymbol: 'iUSDC',
    tokenSlug: undefined,
    pools: [
      {
        name: 'Curve.fi cyDAI/cyUSDC/cyUSDT',
        address: '0x2dded6Da1BF5DBdF597C45fcFaa3194e53EcfeAF',
        dex: 'curve',
      },
    ],
  },
  {
    tokenSymbol: 'iUSDT',
    tokenSlug: undefined,
    pools: [
      {
        name: 'Curve.fi cyDAI/cyUSDC/cyUSDT',
        address: '0x2dded6Da1BF5DBdF597C45fcFaa3194e53EcfeAF',
        dex: 'curve',
      },
    ],
  },
  {
    tokenSymbol: 'LINK',
    tokenSlug: undefined,
    pools: [
      {
        name: 'Curve.fi LINK/sLINK',
        address: '0xF178C0b5Bb7e7aBF4e12A4838C7b7c5bA2C623c0',
        dex: 'curve',
      },
    ],
  },
  {
    tokenSymbol: 'sLINK',
    tokenSlug: undefined,
    pools: [
      {
        name: 'Curve.fi LINK/sLINK',
        address: '0xF178C0b5Bb7e7aBF4e12A4838C7b7c5bA2C623c0',
        dex: 'curve',
      },
    ],
  },
  {
    tokenSymbol: 'ycDAI',
    tokenSlug: undefined,
    pools: [
      {
        name: 'Curve.fi DAI/USDC/USDT/PAX',
        address: '0x06364f10B501e868329afBc005b3492902d6C763',
        dex: 'curve',
      },
    ],
  },
  {
    tokenSymbol: 'ycUSDC',
    tokenSlug: undefined,
    pools: [
      {
        name: 'Curve.fi DAI/USDC/USDT/PAX',
        address: '0x06364f10B501e868329afBc005b3492902d6C763',
        dex: 'curve',
      },
    ],
  },
  {
    tokenSymbol: 'ycUSDT',
    tokenSlug: undefined,
    pools: [
      {
        name: 'Curve.fi DAI/USDC/USDT/PAX',
        address: '0x06364f10B501e868329afBc005b3492902d6C763',
        dex: 'curve',
      },
    ],
  },
  {
    tokenSymbol: 'USDP',
    tokenSlug: 'pax-dollar',
    pools: [
      {
        name: 'Curve.fi DAI/USDC/USDT/PAX',
        address: '0x06364f10B501e868329afBc005b3492902d6C763',
        dex: 'curve',
      },
      {
        name: 'Curve.fi USDP/3Crv',
        address: '0x42d7025938bEc20B69cBae5A77421082407f053A',
        dex: 'curve',
      },
    ],
  },
  {
    tokenSymbol: 'renBTC',
    tokenSlug: undefined,
    pools: [
      {
        name: 'Curve.fi renBTC/wBTC',
        address: '0x93054188d876f558f4a66B2EF1d97d16eDf0895B',
        dex: 'curve',
      },
      {
        name: 'Curve.fi renBTC/wBTC/sBTC',
        address: '0x7fC77b5c7614E1533320Ea6DDc2Eb61fa00A9714',
        dex: 'curve',
      },
      {
        name: 'Curve.fi bBTC/sbtcCRV',
        address: '0x071c661B4DeefB59E2a3DdB20Db036821eeE8F4b',
        dex: 'curve',
      },
      {
        name: 'Curve.fi oBTC/sbtcCRV',
        address: '0xd81dA8D904b52208541Bade1bD6595D8a251F8dd',
        dex: 'curve',
      },
      {
        name: 'Curve.fi pBTC/sbtcCRV',
        address: '0x7F55DDe206dbAD629C080068923b36fe9D6bDBeF',
        dex: 'curve',
      },
      {
        name: 'Curve.fi tBTC/sbtcCrv',
        address: '0xC25099792E9349C7DD09759744ea681C7de2cb66',
        dex: 'curve',
      },
    ],
  },
  {
    tokenSymbol: 'aSUSD',
    tokenSlug: undefined,
    pools: [
      {
        name: 'Curve.fi aDAI/aSUSD',
        address: '0xEB16Ae0052ed37f479f7fe63849198Df1765a733',
        dex: 'curve',
      },
    ],
  },
  {
    tokenSymbol: 'sBTC',
    tokenSlug: undefined,
    pools: [
      {
        name: 'Curve.fi renBTC/wBTC/sBTC',
        address: '0x7fC77b5c7614E1533320Ea6DDc2Eb61fa00A9714',
        dex: 'curve',
      },
      {
        name: 'Curve.fi bBTC/sbtcCRV',
        address: '0x071c661B4DeefB59E2a3DdB20Db036821eeE8F4b',
        dex: 'curve',
      },
      {
        name: 'Curve.fi oBTC/sbtcCRV',
        address: '0xd81dA8D904b52208541Bade1bD6595D8a251F8dd',
        dex: 'curve',
      },
      {
        name: 'Curve.fi pBTC/sbtcCRV',
        address: '0x7F55DDe206dbAD629C080068923b36fe9D6bDBeF',
        dex: 'curve',
      },
      {
        name: 'Curve.fi tBTC/sbtcCrv',
        address: '0xC25099792E9349C7DD09759744ea681C7de2cb66',
        dex: 'curve',
      },
      {
        name: 'Curve.fi wBTC/sBTC',
        address: '0xf253f83AcA21aAbD2A20553AE0BF7F65C755A07F',
        dex: 'curve',
      },
    ],
  },
  {
    tokenSymbol: 'sETH',
    tokenSlug: undefined,
    pools: [
      {
        name: 'Curve.fi ETH/sETH',
        address: '0xc5424B857f758E906013F3555Dad202e4bdB4567',
        dex: 'curve',
      },
    ],
  },
  {
    tokenSymbol: 'stETH',
    tokenSlug: undefined,
    pools: [
      {
        name: 'Curve.fi ETH/stETH',
        address: '0xDC24316b9AE028F1497c275EB9192a3Ea0f67022',
        dex: 'curve',
      },
    ],
  },
  {
    tokenSymbol: 'sUSD',
    tokenSlug: undefined,
    pools: [
      {
        name: 'Curve.fi DAI/USDC/USDT/sUSD',
        address: '0xA5407eAE9Ba41422680e2e00537571bcC53efBfD',
        dex: 'curve',
      },
    ],
  },
  {
    tokenSymbol: 'yTUSD',
    tokenSlug: undefined,
    pools: [
      {
        name: 'Curve.fi yDAI/yUSDC/yUSDT/yTUSD',
        address: '0x45F783CCE6B7FF23B2ab2D70e416cdb7D6055f51',
        dex: 'curve',
      },
    ],
  },
  {
    tokenSymbol: 'DUSD',
    tokenSlug: 'digitaldollar',
    pools: [
      {
        name: 'Curve.fi DUSD/3Crv',
        address: '0x8038C01A0390a8c547446a0b2c18fc9aEFEcc10c',
        dex: 'curve',
      },
    ],
  },
  {
    tokenSymbol: 'GUSD',
    tokenSlug: 'gemini-dollar',
    pools: [
      {
        name: 'Curve.fi GUSD/3Crv',
        address: '0x4f062658EaAF2C1ccf8C8e36D6824CDf41167956',
        dex: 'curve',
      },
    ],
  },
  {
    tokenSymbol: 'HUSD',
    tokenSlug: 'husd',
    pools: [
      {
        name: 'Curve.fi HUSD/3Crv',
        address: '0x3eF6A01A0f81D6046290f3e2A8c5b843e738E604',
        dex: 'curve',
      },
    ],
  },
  {
    tokenSymbol: 'LINKUSD',
    tokenSlug: undefined,
    pools: [
      {
        name: 'Curve.fi LinkUSD/3Crv',
        address: '0xE7a24EF0C5e95Ffb0f6684b813A78F2a3AD7D171',
        dex: 'curve',
      },
    ],
  },
  {
    tokenSymbol: 'mUSD',
    tokenSlug: undefined,
    pools: [
      {
        name: 'Curve.fi MUSD/3Crv',
        address: '0x8474DdbE98F5aA3179B3B3F5942D724aFcdec9f6',
        dex: 'curve',
      },
    ],
  },
  {
    tokenSymbol: 'RSV',
    tokenSlug: 'reserve',
    pools: [
      {
        name: 'Curve.fi RSV/3Crv',
        address: '0xC18cC39da8b11dA8c3541C598eE022258F9744da',
        dex: 'curve',
      },
    ],
  },
  {
    tokenSymbol: 'USDK',
    tokenSlug: 'usdk',
    pools: [
      {
        name: 'Curve.fi USDK/3Crv',
        address: '0x3E01dD8a5E1fb3481F0F589056b428Fc308AF0Fb',
        dex: 'curve',
      },
    ],
  },
  {
    tokenSymbol: 'USDN',
    tokenSlug: 'neutrino-usd',
    pools: [
      {
        name: 'Curve.fi USDN/3Crv',
        address: '0x0f9cb53Ebe405d49A0bbdBD291A65Ff571bC83e1',
        dex: 'curve',
      },
    ],
  },
  {
    tokenSymbol: 'USTC',
    tokenSlug: 'terraclassicusd',
    pools: [
      {
        name: 'Curve.fi UST/3Crv',
        address: '0x890f4e345B1dAED0367A877a1612f86A1f86985f',
        dex: 'curve',
      },
      {
        name: undefined,
        address: '0x4e0915C88bC70750D68C481540F081fEFaF22273',
        dex: 'curve',
      },
    ],
  },
  {
    tokenSymbol: 'BBTC',
    tokenSlug: undefined,
    pools: [
      {
        name: 'Curve.fi bBTC/sbtcCRV',
        address: '0x071c661B4DeefB59E2a3DdB20Db036821eeE8F4b',
        dex: 'curve',
      },
    ],
  },
  {
    tokenSymbol: 'oBTC',
    tokenSlug: undefined,
    pools: [
      {
        name: 'Curve.fi oBTC/sbtcCRV',
        address: '0xd81dA8D904b52208541Bade1bD6595D8a251F8dd',
        dex: 'curve',
      },
    ],
  },
  {
    tokenSymbol: 'pBTC',
    tokenSlug: undefined,
    pools: [
      {
        name: 'Curve.fi pBTC/sbtcCRV',
        address: '0x7F55DDe206dbAD629C080068923b36fe9D6bDBeF',
        dex: 'curve',
      },
    ],
  },
  {
    tokenSymbol: 'TBTC',
    tokenSlug: undefined,
    pools: [
      {
        name: 'Curve.fi tBTC/sbtcCrv',
        address: '0xC25099792E9349C7DD09759744ea681C7de2cb66',
        dex: 'curve',
      },
    ],
  },
  {
    tokenSymbol: 'TUSD',
    tokenSlug: 'trueusd',
    pools: [
      {
        name: undefined,
        address: '0xEcd5e75AFb02eFa118AF914515D6521aaBd189F1',
        dex: 'curve',
      },
    ],
  },
  {
    tokenSymbol: 'LUSD',
    tokenSlug: 'liquity-usd',
    pools: [
      {
        name: undefined,
        address: '0xEd279fDD11cA84bEef15AF5D39BB4d4bEE23F0cA',
        dex: 'curve',
      },
    ],
  },
  {
    tokenSymbol: 'FRAX',
    tokenSlug: 'frax',
    pools: [
      {
        name: undefined,
        address: '0xd632f22692FaC7611d2AA1C0D552930D43CAEd3B',
        dex: 'curve',
      },
      {
        name: undefined,
        address: '0x4e0915C88bC70750D68C481540F081fEFaF22273',
        dex: 'curve',
      },
      {
        name: 'Curve.fi FRAX/USDC',
        address: '0xDcEF968d416a41Cdac0ED8702fAC8128A64241A2',
        dex: 'curve',
      },
    ],
  },
  {
    tokenSymbol: 'BUSD',
    tokenSlug: 'binance-usd',
    pools: [
      {
        name: undefined,
        address: '0x4807862AA8b2bF68830e4C8dc86D0e9A998e085a',
        dex: 'curve',
      },
    ],
  },
  {
    tokenSymbol: 'rETH',
    tokenSlug: undefined,
    pools: [
      {
        name: 'Curve.fi ETH/rETH',
        address: '0xF9440930043eb3997fc70e1339dBb11F341de7A8',
        dex: 'curve',
      },
    ],
  },
  {
    tokenSymbol: 'alUSD',
    tokenSlug: undefined,
    pools: [
      {
        name: undefined,
        address: '0x43b4FdFD4Ff969587185cDB6f0BD875c5Fc83f8c',
        dex: 'curve',
      },
    ],
  },
  {
    tokenSymbol: 'WETH',
    tokenSlug: undefined,
    pools: [
      {
        name: 'Curve.fi USD-BTC-ETH',
        address: '0x80466c64868E1ab14a1Ddf27A676C3fcBE638Fe5',
        dex: 'curve',
      },
    ],
  },
  {
    tokenSymbol: 'RAI',
    tokenSlug: undefined,
    pools: [
      {
        name: 'RAI3CRV',
        address: '0x618788357D0EBd8A37e763ADab3bc575D54c2C7d',
        dex: 'curve',
      },
    ],
  },
  {
    tokenSymbol: 'MIM',
    tokenSlug: 'magic-internet-money',
    pools: [
      {
        name: undefined,
        address: '0x5a6A4D54456819380173272A5E8E9B9904BdF41B',
        dex: 'curve',
      },
    ],
  },
  {
    tokenSymbol: 'EURT',
    tokenSlug: undefined,
    pools: [
      {
        name: undefined,
        address: '0xFD5dB7463a3aB53fD211b4af195c5BCCC1A03890',
        dex: 'curve',
      },
    ],
  },
  {
    tokenSymbol: 'frxETH',
    tokenSlug: undefined,
    pools: [
      {
        name: 'Curve.fi ETH/frxETH',
        address: '0xa1F8A6807c402E4A15ef4EBa36528A3FED24E577',
        dex: 'curve',
      },
    ],
  },
];
