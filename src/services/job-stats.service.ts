import { isEmpty } from '@utils/util';
import { globalStatsModel } from '@models/job-stats.model';
import { GlobalStats, LlamaStablecoinsResponse, StablecoinsStats } from '@interfaces/jobs-stats.interface';
import { stablecoinsStatsModel } from '@/models/stablecoins-stats.model';
import { llamaStablecoinsClient } from './api-clients';

class JobStatsService {
  public async getGlobalStats(id: string): Promise<GlobalStats> {
    return globalStatsModel.findById(id);
  }

  public async saveGlobalStats(data: GlobalStats): Promise<GlobalStats> {
    if (isEmpty(data)) throw new Error('Data is empty');
    return globalStatsModel.create(data);
  }

  public async getAllGlobalStats(): Promise<GlobalStats[]> {
    return globalStatsModel.find({}).sort({ _id: 1 });
  }

  public async getStablecoinsStats(id: string): Promise<StablecoinsStats> {
    return stablecoinsStatsModel.findById(id);
  }

  public async saveStablecoinsStats(data: StablecoinsStats): Promise<StablecoinsStats> {
    if (isEmpty(data)) throw new Error('Data is empty');
    return stablecoinsStatsModel.create(data);
  }

  public async getAllStablecoinsStats(): Promise<StablecoinsStats[]> {
    return stablecoinsStatsModel.find({}).sort({ _id: 1 });
  }

  public async getStablecoinsStatsFromLlama(): Promise<LlamaStablecoinsResponse[]> {
    return (await llamaStablecoinsClient.get('stablecoincharts/all')).data;
  }
}

export default JobStatsService;
