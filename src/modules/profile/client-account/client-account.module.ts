import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Client } from "@entities/Client/client.entity";
import { GetClientProfileController, GetClientProfileService } from "./get-profile";
import { EditClientAccountController, EditClientAccountService } from "./edit-account";

@Module({
  imports: [TypeOrmModule.forFeature([Client])],
  controllers: [GetClientProfileController, EditClientAccountController],
  providers: [GetClientProfileService, EditClientAccountService],
})
export class ClientAccountModule {}
