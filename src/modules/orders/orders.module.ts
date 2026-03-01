import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Order } from "@entities/Order/order.entity";
import { OrderResponse } from "@entities/OrderResponse/order-response.entity";
import { Company } from "@entities/Company/company.entity";
import { OrdersController } from "./orders.controller";
import { AdminOrdersController } from "./admin/admin-orders.controller";
import { OrdersService } from "./orders.service";

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderResponse, Company])],
  controllers: [OrdersController, AdminOrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
