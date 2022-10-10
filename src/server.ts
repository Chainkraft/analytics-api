import App from '@/app';
import AuthRoute from '@routes/auth.route';
import IndexRoute from '@routes/index.route';
import UsersRoute from '@routes/users.route';
import validateEnv from '@utils/validateEnv';
import SubscribersRoute from './routes/subscribers.route';
import TokensRoute from './routes/token.route';
import ContractsRoute from '@routes/contracts.route';
import StablecoinsRoute from '@routes/stablecoins.route';

validateEnv();

const app = new App([
  new AuthRoute(),
  new ContractsRoute(),
  new IndexRoute(),
  new SubscribersRoute(),
  new TokensRoute(),
  new StablecoinsRoute(),
  new UsersRoute(),
]);

app.listen();
