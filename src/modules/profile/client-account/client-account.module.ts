import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Client } from "@entities/Client/client.entity";
import { Order } from "@entities/Order/order.entity";
import { Company } from "@entities/Company/company.entity";
import { OrderResponse } from "@entities/OrderResponse/order-response.entity";
import { CompanyReview } from "@entities/CompanyReview/company-review.entity";
import { OrderSuggestion } from "@entities/OrderSuggestion/order-suggestion.entity";
import { NotificationRead } from "@entities/NotificationRead/notification-read.entity";
import { StorageModule } from "@infrastructure/storage/storage.module";
import { NotificationReadService } from "../notifications/notification-read.service";
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
import { SuggestOrderService } from "./suggest-order";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Client,
      Order,
      Company,
      OrderResponse,
      CompanyReview,
      OrderSuggestion,
      NotificationRead,
    ]),
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
    SuggestOrderService,
    AdminModerationClientsService,
    NotificationReadService,
  ],
})
export class ClientAccountModule {}
