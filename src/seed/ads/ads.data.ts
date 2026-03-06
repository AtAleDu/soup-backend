import { AdKind } from "@entities/Ad/ad-kind.enum";
import { AdStatus } from "@entities/Ad/ad-status.enum";

export const ADS_SEED_DATA = [
  {
    adKind: AdKind.BANNER,
    placement: "banner",
    title: "Озеленение дворов под ключ",
    description: "Проектирование и благоустройство территорий с гарантией",
    imageUrl: "https://s3.twcstorage.ru/4b615622-soup/ads-mock.svg",
    targetUrl: "https://example.com/green-yard",
    status: AdStatus.ACTIVE,
  },
  {
    adKind: AdKind.BANNER,
    placement: "banner",
    title: "Производство МАФ для парков",
    description: "Собственное производство и монтаж в вашем регионе",
    imageUrl: "https://s3.twcstorage.ru/4b615622-soup/ads-mock.svg",
    targetUrl: "https://example.com/maf",
    status: AdStatus.ACTIVE,
  },
  {
    adKind: AdKind.BANNER,
    placement: "banner",
    title: "Системы полива для ЖК",
    description: "Автополив, сервисное обслуживание, гарантия качества",
    imageUrl: "https://s3.twcstorage.ru/4b615622-soup/ads-mock.svg",
    targetUrl: "https://example.com/watering",
    status: AdStatus.ACTIVE,
  },
] as const;
