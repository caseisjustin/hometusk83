import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Service } from './entities/service.entity';
import { CreateServiceDto } from './dto/create-service.dto';
import { QueryServicesDto } from './dto/query-services.dto';

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
  ) {}

  create(createServiceDto: CreateServiceDto): Promise<Service> {
    const service = this.serviceRepository.create(createServiceDto);
    return this.serviceRepository.save(service);
  }

  async findAll(query: QueryServicesDto): Promise<{ data: Service[], total: number }> {
    const { name, minPrice, maxPrice, page = 0, limit = 10 } = query;

    const qb = this.serviceRepository.createQueryBuilder('service');

    if (name) {
      qb.andWhere('service.name ILIKE :name', { name: `%${name}%` });
    }
    if (minPrice !== undefined) {
      qb.andWhere('service.price >= :minPrice', { minPrice });
    }
    if (maxPrice !== undefined) {
      qb.andWhere('service.price <= :maxPrice', { maxPrice });
    }

    const [data, total] = await qb
      .skip(page * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total };
  }

  findOne(id: number): Promise<Service> {
    return this.serviceRepository.findOne(id);
  }

  update(id: number, updateServiceDto: any): Promise<Service> {
    return this.serviceRepository.save({ ...updateServiceDto, id });
  }

  remove(id: number): Promise<void> {
    return this.serviceRepository.delete(id).then(() => undefined);
  }
}
