import { NextFunction, Request, Response } from 'express';
import JobStatsService from '@/services/job-stats.service';
import { GlobalStats, StablecoinsStats } from '@/interfaces/jobs-stats.interface';

class StatsController {
  private jobStatsService = new JobStatsService();

  public getGlobalStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const globalStats: GlobalStats[] = await this.jobStatsService.getAllGlobalStats();

      res.status(200).json(globalStats);
    } catch (error) {
      next(error);
    }
  };

  public getStablecoinStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const stablecoinsStats: StablecoinsStats[] = await this.jobStatsService.getAllStablecoinsStats();

      res.status(200).json(stablecoinsStats);
    } catch (error) {
      next(error);
    }
  };
}

export default StatsController;
