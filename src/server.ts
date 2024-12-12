import App from '@/app';
import AuthRoute from '@routes/auth.route';
import IndexRoute from '@routes/index.route';
import UsersRoute from '@routes/users.route';
import validateEnv from '@utils/validateEnv';
import SubscribersRoute from './routes/subscribers.route';
import TokensRoute from './routes/token.route';
import ContractsRoute from '@routes/contracts.route';
import StablecoinsRoute from '@routes/stablecoins.route';
import ScoresRoute from './routes/scores.route';
import ProtocolsRoute from '@routes/protocols.route';
import LiquidityPoolsRoute from './routes/pools.route';
import BlockchainsRoute from '@routes/blockchains.route';
import NotificationsRoute from '@routes/notifications.route';
import StatsRoute from './routes/stats.route';

process.on('uncaughtException', error => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

validateEnv();

const app = new App([
  new AuthRoute(),
  new BlockchainsRoute(),
  new ContractsRoute(),
  new ProtocolsRoute(),
  new IndexRoute(),
  new NotificationsRoute(),
  new SubscribersRoute(),
  new TokensRoute(),
  new StatsRoute(),
  new StablecoinsRoute(),
  new UsersRoute(),
  new ScoresRoute(),
  new LiquidityPoolsRoute(),
]);

app.listen();
