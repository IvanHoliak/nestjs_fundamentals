import { DynamicModule, Module } from '@nestjs/common';
import { DataSource, DataSourceOptions } from 'typeorm';

/* First example */

// @Module({
//   providers: [
//     {
//       provide: 'CONNECTION',
//       useValue: new DataSource({
//         type: 'postgres',
//         host: 'localhost',
//         port: 5432,
//       }),
//     },
//   ],
// })

@Module({})

/* Second example */
export class DatabaseModule {
  static register(options: DataSourceOptions): DynamicModule {
    return {
      module: DatabaseModule,
      providers: [
        {
          provide: 'CONNECTION',
          useValue: new DataSource(options),
        },
      ],
    };
  }
}
