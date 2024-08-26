import { DataSource, DataSourceOptions } from 'typeorm';

export const dataSourceOpt: DataSourceOptions = {
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'admin',
  database: 'nestjs_fundamentals',
  entities: ['dist/**/*.entity.js'],
  migrations: ['dist/migrations/*.js'],
};

export default new DataSource(dataSourceOpt);
