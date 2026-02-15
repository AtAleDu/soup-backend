import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Client } from "@entities/Client/client.entity";
import { Order } from "@entities/Order/order.entity";
import { StorageModule } from "@infrastructure/storage/storage.module";
import {
  GetClientProfileController,
  GetClientProfileService,
} from "./get-profile";
import {
  EditClientAccountController,
  EditClientAccountService,
} from "./edit-account";
import { CreateOrderController, CreateOrderService } from "./create-order";

@Module({
  imports: [
    TypeOrmModule.forFeature([Client, Order]),
    StorageModule,
  ],
  controllers: [
    GetClientProfileController,
    EditClientAccountController,
    CreateOrderController,
  ],
  providers: [
    GetClientProfileService,
    EditClientAccountService,
    CreateOrderService,
  ],
})
export class ClientAccountModule {}
