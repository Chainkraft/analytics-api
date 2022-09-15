import { NextFunction, Request, Response } from 'express';
import tokenService from '@services/tokens.service';
import { Token } from '@/interfaces/tokens.inteface';

class TokensController {
  public tokenService = new tokenService();

  public getPeggedTokens = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const findAllPeggedData: Token[] = await this.tokenService.findAllPeggedTokens();

      res.status(200).json({ data: findAllPeggedData, message: 'findAll' });
    } catch (error) {
      next(error);
    }
  };
}

export default TokensController;
