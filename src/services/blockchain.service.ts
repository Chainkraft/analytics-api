import { ContractNetwork } from '@interfaces/contracts.interface';
import { providers } from '@config';
import { BlockNumberCache } from '@/config/cache';
import axios from 'axios';

class BlockchainService {
  public async getBlockNumber(network: ContractNetwork): Promise<number> {
    let block: number = BlockNumberCache.get(network);
    if (block === undefined) {
      const provider = providers.get(network);
      block = await provider.core.getBlockNumber();
      BlockNumberCache.set(network, block);
    }
    return block;
  }

  // retrive block based on unixTimestamp array - shamelessly copied from our friends at Defillama
  public async getBlocksByTime(timestamps: number[], chainString: string): Promise<number[]> {
    const chain = chainString === 'avalanche' ? 'avax' : chainString;
    const blocks = [];
    for (const timestamp of timestamps) {
      const response = await axios.get<{ height: number; timestamp: number }>(`https://coins.llama.fi/block/${chain}/${timestamp}`);
      blocks.push(response.data.height);
    }
    return blocks;
  }
}

export default BlockchainService;
