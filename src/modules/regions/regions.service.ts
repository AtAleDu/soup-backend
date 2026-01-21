import { Injectable } from "@nestjs/common";
import { RegionResponseDto } from "./dto/region-response.dto";
import { REGIONS } from "./regions.constants";

@Injectable()
export class RegionsService {
  findAll(): RegionResponseDto[] {
    return REGIONS.map((label, index) => ({
      id: index + 1,
      label,
    }));
  }
}
