import { isEmpty } from '@utils/util';
import { globalStatsModel } from '@models/job-stats.model';
import { GlobalStats } from '@interfaces/jobs-stats.interface';

class JobStatsService {
  public async getGlobalStats(id: string): Promise<GlobalStats> {
    return globalStatsModel.findById(id);
  }

  public async saveGlobalStats(data: GlobalStats): Promise<GlobalStats> {
    if (isEmpty(data)) throw new Error('Data is empty');
    return globalStatsModel.create(data);
  }
}

export default JobStatsService;
