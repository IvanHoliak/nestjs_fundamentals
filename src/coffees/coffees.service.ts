import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Coffee } from './entities/coffee.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CreateCoffeeDto } from './dto/create-coffee.dto';
import { UpdateCoffeeDto } from './dto/update-coffee.dto';
import { Flavor } from './entities/flavor.entity';
import { Event } from 'src/events/entities/event.entity';
import {
  COFFEE_BRANDS,
  COFFEE_BRANDS_FACTORY,
  COFFEE_BRANDS_FACTORY_ASYNC,
} from './coffees.constants';
import { CoffeeBrandsFactory } from './coffee-brands.factory';
import { ConfigService, ConfigType } from '@nestjs/config';
import coffeesConfig from 'src/config/coffees.config';

@Injectable()
export class CoffeesService {
  constructor(
    @InjectRepository(Coffee)
    private readonly coffeeRepository: Repository<Coffee>,
    @InjectRepository(Flavor)
    private readonly flavorRepository: Repository<Flavor>,
    private readonly dataSource: DataSource,
    // private readonly configService: ConfigService,
    @Inject(coffeesConfig.KEY)
    private readonly coffeesConfiguration: ConfigType<typeof coffeesConfig>,
    @Inject(COFFEE_BRANDS) coffeeBrands: string[],
    @Inject(COFFEE_BRANDS_FACTORY) coffeeBrandsFactory: CoffeeBrandsFactory,
    @Inject(COFFEE_BRANDS_FACTORY_ASYNC)
    coffeeBrandsFactoryAsync: Promise<string[]>,
  ) {
    console.log(coffeeBrands);
    console.log(coffeeBrandsFactory.create());
    console.log(coffeeBrandsFactoryAsync);
    coffeeBrandsFactory.getAsync().then((brands) => console.log(brands));
    // console.log('[!] Partial registration', this.configService.get('coffees')); // Less typed and safe because we may not know what is in 'coffees'
    console.log('[!] Partial registration', this.coffeesConfiguration); // More typed and safe
  }

  findAll(paginationQueryDto: PaginationQueryDto) {
    const { take, skip } = paginationQueryDto;
    return this.coffeeRepository.find({ relations: ['flavors'], take, skip });
  }

  async findOne(id: number) {
    const coffee = await this.coffeeRepository.findOne({
      where: { id },
      relations: ['flavors'],
    });
    if (!coffee) throw new NotFoundException(`Coffee #${id} not found`);

    return coffee;
  }

  async create(createCoffeeDto: CreateCoffeeDto) {
    const flavors = await Promise.all(
      createCoffeeDto.flavors.map((name) => this.preloadFlavorByName(name)),
    );

    const coffee = this.coffeeRepository.create({
      ...createCoffeeDto,
      flavors,
    });

    return this.coffeeRepository.save(coffee);
  }

  async update(id: number, updateCoffeeDto: UpdateCoffeeDto) {
    const flavors =
      updateCoffeeDto &&
      (await Promise.all(
        updateCoffeeDto.flavors.map((name) => this.preloadFlavorByName(name)),
      ));

    const coffee = await this.coffeeRepository.preload({
      id,
      ...updateCoffeeDto,
      flavors,
    });

    if (!coffee) throw new NotFoundException(`Coffee #${id} not found`);

    return this.coffeeRepository.save(coffee);
  }

  async remove(id: number) {
    const coffee = await this.findOne(id);
    return this.coffeeRepository.remove(coffee);
  }

  async recommendCoffee(coffee: Coffee) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      coffee.recommendations++;

      const recommendEvent: Event = new Event();
      recommendEvent.name = 'recommend_coffee';
      recommendEvent.type = 'coffee';
      recommendEvent.payload = { coffeeId: coffee.id };

      await queryRunner.manager.save(coffee);
      await queryRunner.manager.save(recommendEvent);

      await queryRunner.commitTransaction();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }

  private async preloadFlavorByName(name: string): Promise<Flavor> {
    const existingFlavor = await this.flavorRepository.findOne({
      where: { name },
    });

    if (existingFlavor) return existingFlavor;

    return this.flavorRepository.create({ name });
  }
}
