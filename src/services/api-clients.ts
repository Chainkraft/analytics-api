import axios from 'axios';

export const llamaStablecoinsClient = axios.create({
  baseURL: 'https://stablecoins.llama.fi/',
  headers: {
    'content-type': 'application/json',
  },
});
