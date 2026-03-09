import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Client } from "@entities/Client/client.entity";
import { Order } from "@entities/Order/order.entity";
import { StorageModule } from "@infrastructure/storage/storage.module";
import {
  AdminModerationClientsController,
  AdminModerationClientsService,
} from "./admin-moderation";
import {
  GetClientProfileController,
  GetClientProfileService,
} from "./get-profile";
import { ClientNotificationsController } from "./notifications/client-notifications.controller";
import { ClientNotificationsService } from "./notifications/client-notifications.service";
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
    ClientNotificationsController,
    EditClientAccountController,
    CreateOrderController,
    AdminModerationClientsController,
  ],
  providers: [
    GetClientProfileService,
    ClientNotificationsService,
    EditClientAccountService,
    CreateOrderService,
    AdminModerationClientsService,
  ],
})
export class ClientAccountModule {}
