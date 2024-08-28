import { Module } from '@nestjs/common';
import { CoffeesController } from './coffees.controller';
import { CoffeesService } from './coffees.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Coffee } from './entities/coffee.entity';
import { Flavor } from './entities/flavor.entity';
import { Event } from 'src/events/entities/event.entity';
import {
  COFFEE_BRANDS,
  COFFEE_BRANDS_FACTORY,
  COFFEE_BRANDS_FACTORY_ASYNC,
} from './coffees.constants';
import { CoffeeBrandsFactory } from './coffee-brands.factory';
import { DataSource } from 'typeorm';
import { ConfigModule } from '@nestjs/config';
import coffeesConfig from 'src/config/coffees.config';

class ConfigService {}
class DevelopmentConfigService {}
class ProductionConfigService {}

@Module({
  imports: [
    TypeOrmModule.forFeature([Coffee, Flavor, Event]),
    ConfigModule.forFeature(coffeesConfig),
  ],
  controllers: [CoffeesController],
  providers: [
    CoffeesService,
    CoffeeBrandsFactory,
    {
      provide: ConfigService,
      useClass:
        process.env.NODE_ENV === 'development'
          ? DevelopmentConfigService
          : ProductionConfigService,
    },
    { provide: COFFEE_BRANDS, useValue: ['buddy brew', 'nescafe'] }, // useValue
    {
      provide: COFFEE_BRANDS_FACTORY,
      useFactory: (brandsFactory: CoffeeBrandsFactory) => brandsFactory,
      inject: [CoffeeBrandsFactory],
    }, // useFactory
    {
      provide: COFFEE_BRANDS_FACTORY_ASYNC,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      useFactory: async (dataSource: DataSource): Promise<string[]> => {
        /* Here you can get data from the database or anything else */
        /* Example */
        // const coffeeFlavors = await dataSource.query('SELECT * FROM flavor');
        // console.log(coffeeFlavors);

        /* Just for example */
        const coffeeBrands = await Promise.resolve([
          'async:nestle',
          'async:starbucks',
        ]);
        console.log('[!] Async factory is called');
        return coffeeBrands;
      },
      inject: [DataSource],
    }, // useFactory ASYNC
  ],
  exports: [CoffeesService],
})
export class CoffeesModule {}
