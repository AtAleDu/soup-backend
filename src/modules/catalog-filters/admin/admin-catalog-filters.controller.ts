import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
} from "@nestjs/common";
import { AdminCatalogFiltersService } from "./admin-catalog-filters.service";
import { CreateCatalogFilterDto } from "./dto/create-catalog-filter.dto";
import { UpdateCatalogFilterDto } from "./dto/update-catalog-filter.dto";

@Controller("admin/catalog/filters")
export class AdminCatalogFiltersController {
  constructor(private readonly service: AdminCatalogFiltersService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Post()
  create(@Body() dto: CreateCatalogFilterDto) {
    return this.service.create(dto);
  }

  @Put(":id")
  update(@Param("id") id: string, @Body() dto: UpdateCatalogFilterDto) {
    return this.service.update(id, dto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.service.remove(id);
  }
}
