import { isEmpty } from '@utils/util';
import { HttpException } from '@/exceptions/HttpException';
import scoreModel from '@/models/scores.model';
import { Score } from '@/interfaces/scores.interface';

class TokensScoreService {
  public scoreModel = scoreModel;

  public async findLatestScore(): Promise<Score> {
    return this.scoreModel.findOne().sort({ createdAt: -1 });
  }

  public async createScore(score: Score): Promise<Score> {
    if (isEmpty(score)) throw new HttpException(400, 'Score is empty');
    return await this.scoreModel.create(score);
  }
}

export default TokensScoreService;
