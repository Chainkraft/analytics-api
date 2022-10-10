import { StablecoinPriceAlert } from '@/interfaces/alerts.interface';
import stablecoinPriceAlertModel from '@/models/stablecoin-price-alert.model';
import { isEmpty } from '@utils/util';
import { HttpException } from '@/exceptions/HttpException';

class AlertService {
  public stablecoinPriceAlertModel = stablecoinPriceAlertModel;

  public async findAllStablecoinPriceAlerts(): Promise<StablecoinPriceAlert[]> {
    return this.stablecoinPriceAlertModel.find();
  }

  public async findLatestStablecoinPriceAlert(): Promise<StablecoinPriceAlert> {
    return this.stablecoinPriceAlertModel.findOne().sort({ created_at: -1 });
  }

  public async createStablecoinAlert(alert: StablecoinPriceAlert): Promise<StablecoinPriceAlert> {
    if (isEmpty(alert)) throw new HttpException(400, 'Alert is empty');
    return await this.stablecoinPriceAlertModel.create(alert);
  }
}

export default AlertService;
