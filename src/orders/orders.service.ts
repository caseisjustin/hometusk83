import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { QueryOrdersDto } from './dto/query-orders.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  create(createOrderDto: CreateOrderDto): Promise<Order> {
    const order = this.orderRepository.create(createOrderDto);
    return this.orderRepository.save(order);
  }

  async findAll(query: QueryOrdersDto): Promise<{ data: Order[], total: number }> {
    const { userId, serviceId, minTotalPrice, maxTotalPrice, page = 0, limit = 10 } = query;

    const qb = this.orderRepository.createQueryBuilder('order');

    if (userId) {
      qb.andWhere('order.userId = :userId', { userId });
    }
    if (serviceId) {
      qb.andWhere('order.serviceId = :serviceId', { serviceId });
    }
    if (minTotalPrice !== undefined) {
      qb.andWhere('order.totalPrice >= :minTotalPrice', { minTotalPrice });
    }
    if (maxTotalPrice !== undefined) {
      qb.andWhere('order.totalPrice <= :maxTotalPrice', { maxTotalPrice });
    }

    const [data, total] = await qb
      .skip(page * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total };
  }

  findOne(id: number): Promise<Order> {
    return this.orderRepository.findOne(id);
  }

  update(id: number, updateOrderDto: any): Promise<Order> {
    return this.orderRepository.save({ ...updateOrderDto, id });
  }

  remove(id: number): Promise<void> {
    return this.orderRepository.delete(id).then(() => undefined);
  }
}
