import { CREDENTIALS, LOG_FORMAT, NODE_ENV, ORIGIN, PORT } from '@config';
import { dbConnection } from '@databases';
import { Routes } from '@interfaces/routes.interface';
import { userContext } from '@middlewares/auth.middleware';
import errorMiddleware from '@middlewares/error.middleware';
import { logger, skip, stream } from '@/config/logger';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import hpp from 'hpp';
import promBundle from 'express-prom-bundle';
import { connect, set } from 'mongoose';
import morgan from 'morgan';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { JobManager } from './jobs/job.manager';
import { RefreshStablecoinPricesJob } from './jobs/refresh-stablecoin-prices.job';
import { RefreshScoreJob } from './jobs/score-calculation.job';
import slug from 'slug';

class App {
  public app: express.Application;
  public env: string;
  public port: string | number;
  private jobManager: JobManager;

  constructor(routes: Routes[]) {
    this.app = express();
    this.env = NODE_ENV || 'development';
    this.port = PORT || 3000;

    this.connectToDatabase();
    this.initializeMiddlewares();
    this.initializeRoutes(routes);
    this.initializeSwagger();
    this.initializeErrorHandling();
    this.initializeJobManager();
  }

  public listen() {
    this.app.listen(this.port, () => {
      logger.info(`=================================`);
      logger.info(`======= ENV: ${this.env} =======`);
      logger.info(`🚀 App listening on the port ${this.port}`);
      logger.info(`=================================`);
    });
  }

  public getServer() {
    return this.app;
  }

  private connectToDatabase() {
    if (this.env !== 'production') {
      set('debug', true);
    }

    connect(dbConnection.url, dbConnection.options);
  }

  private initializeMiddlewares() {
    const metricsMiddleware = promBundle({
      includeMethod: true,
      includePath: true,
      includeStatusCode: true,
      includeUp: true,
      customLabels: { project_name: 'analytics-api' },
      promClient: {
        collectDefaultMetrics: {},
      },
    });

    this.app.use(metricsMiddleware);
    this.app.use(morgan(LOG_FORMAT, { stream, skip }));
    this.app.use(cors({ origin: ORIGIN, credentials: CREDENTIALS }));
    this.app.use(hpp());
    this.app.use(helmet({ crossOriginResourcePolicy: false }));
    this.app.use(compression());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(cookieParser());
    this.app.use(userContext);

    // static resources
    this.app.use('/static', express.static('static'));

    this.loadExtraConfiguration();
  }

  private loadExtraConfiguration() {
    slug.extend({ '+': 'plus' });
    slug.extend({ '-': 'minus' });
  }

  private initializeRoutes(routes: Routes[]) {
    routes.forEach(route => {
      this.app.use('/', route.router);
    });
  }

  private initializeSwagger() {
    const options = {
      swaggerDefinition: {
        info: {
          title: 'REST API',
          version: '1.0.0',
          description: 'Example docs',
        },
      },
      apis: ['swagger.yaml'],
    };

    const specs = swaggerJSDoc(options);
    this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
  }

  private initializeErrorHandling() {
    this.app.use(errorMiddleware);
  }

  private initializeJobManager() {
    this.jobManager = new JobManager();

    // customized initial data fetch
    this.jobManager
      .getJob(RefreshStablecoinPricesJob.name)
      ?.executeJob()
      .then(() => {
        this.jobManager.getJob(RefreshScoreJob.name).executeJob();
      });
  }
}

export default App;
