import { IsOptional, IsPositive } from 'class-validator';

export class PaginationQueryDto {
  @IsOptional()
  @IsPositive()
  take: number;

  @IsOptional()
  @IsPositive()
  skip: number;
}
