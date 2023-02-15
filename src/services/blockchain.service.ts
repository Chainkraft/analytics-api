import { ContractNetwork } from '@interfaces/contracts.interface';
import { providers } from '@config';
import { BlockNumberCache } from '@/config/cache';

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
}

export default BlockchainService;
