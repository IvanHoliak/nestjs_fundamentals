import { defaultAppPort, defaultDBHost, defaultDBPort } from './app.constants';
import { TAppConfig } from './types';

export default (): TAppConfig => ({
  port: parseInt(process.env.APP_PORT, 10) || defaultAppPort,
  environment: process.env.NODE_ENV || 'development',
  database: {
    type: 'postgres',
    host: process.env.PG_DATABASE_HOST || defaultDBHost,
    port: parseInt(process.env.PG_DATABASE_PORT, 10) || defaultDBPort,
    username: process.env.PG_DATABASE_USERNAME,
    password: process.env.PG_DATABASE_PASSWORD,
    database: process.env.PG_DATABASE_NAME,
  },
});
