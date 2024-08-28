import { DataSourceOptions } from 'typeorm';

export type TAppConfig = {
  port: number;
  environment: string;
  database: DataSourceOptions;
};
