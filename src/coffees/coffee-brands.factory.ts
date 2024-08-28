import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class CoffeeBrandsFactory {
  private brands: string[] = [];

  constructor(private readonly dataSource: DataSource) {}

  create() {
    this.brands = [
      'factory:new coffee',
      'factory:buddy brew',
      'factory:nescafe',
    ];
    return this.brands;
  }

  get() {
    return this.brands;
  }

  async getAsync() {
    /* Here you can get data from the database or anything else */
    /* Just for example */
    const coffeeBrands = await this.dataSource.query('SELECT * FROM flavor');
    console.log(
      '[!] Async factory is called from CoffeeBrandsFactory.getAsync()',
    );
    return ['db', ...coffeeBrands];
  }
}
