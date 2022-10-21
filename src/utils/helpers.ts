const R = require('ramda');

export const priceParser = R.applySpec({
  name: R.pipe(R.prop('name')),
  symbol: R.pipe(R.prop('symbol')),
  description: R.pipe(R.prop('description'), R.prop('en')),
  price_change_24h_usd: R.pipe(R.prop('market_data'), R.prop('price_change_24h_in_currency'), R.prop('usd')),
  current_price: R.pipe(R.prop('market_data'), R.prop('current_price'), R.prop('usd')),
  market_cap: R.pipe(R.prop('market_data'), R.prop('market_cap'), R.prop('usd')),
  atl: R.pipe(R.prop('market_data'), R.prop('atl'), R.prop('usd')),
  ath: R.pipe(R.prop('market_data'), R.prop('ath'), R.prop('usd')),
  image: R.pipe(R.prop('image')),
});

export const stableByMarketCapParser = R.applySpec({
  name: R.pipe(R.prop('name')),
  symbol: R.pipe(R.prop('symbol')),
  price_change_24h_usd: R.pipe(R.prop('price_change_24h')),
  current_price: R.pipe(R.prop('current_price')),
  market_cap: R.pipe(R.prop('market_cap')),
  atl: R.pipe(R.prop('atl')),
  ath: R.pipe(R.prop('ath')),
  image: R.pipe(R.prop('image')),
});

export const llamaStablesListParser = R.applySpec({
  gecko_id: R.pipe(R.prop('gecko_id')),
  llama_id: R.pipe(R.prop('id')),
  name: R.pipe(R.prop('name')),
  symbol: R.pipe(R.prop('symbol')),
  chains: R.pipe(R.prop('chains')),
  pegMechanism: R.pipe(R.prop('pegMechanism')),
});

export const llamaStablecoinDetailsParser = R.applySpec({
  description: R.pipe(R.prop('description')),
  audits: R.pipe(R.prop('auditLinks')),
  twitter: R.pipe(R.prop('twitter')),
  llama_id: R.pipe(R.prop('id')),
});

export const currencyFormat = (num: string, fraction = 0) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: fraction,
    minimumFractionDigits: fraction,
  }).format(Number.parseFloat(num));
