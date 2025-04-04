import { NextFunction, Request, Response } from 'express';
import TokensScoreService from '@/services/tokens-scores.service';
import { Score } from '@/interfaces/scores.interface';

class ScoresController {
  public scoreService = new TokensScoreService();

  public getLastScore = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const findLastScore: Score = await this.scoreService.findLatestScore();

      res.status(200).json({ data: findLastScore, message: 'findOne' });
    } catch (error) {
      next(error);
    }
  };
}

export default ScoresController;
