import { DataSource } from "typeorm";
import { Ad } from "@entities/Ad/ad.entity";
import { Company } from "@entities/Company/company.entity";
import { ADS_SEED_DATA } from "./ads.data";

function formatDateOnly(date: Date) {
  return date.toISOString().slice(0, 10);
}

export async function seedAds(dataSource: DataSource) {
  const companyRepo = dataSource.getRepository(Company);
  const adRepo = dataSource.getRepository(Ad);
  const company = await companyRepo.findOne({ where: {} });

  const startDate = formatDateOnly(new Date());
  const endDate = formatDateOnly(
    new Date(Date.now() + 1000 * 60 * 60 * 24 * 90),
  );

  for (const data of ADS_SEED_DATA) {
    const isMainPageBanner = data.placement === "main-page-banner";
    const companyId = isMainPageBanner ? null : company?.companyId ?? null;

    if (!isMainPageBanner && !companyId) {
      continue;
    }

    const existing = await adRepo.findOne({
      where: {
        placement: data.placement,
        title: data.title,
        ...(isMainPageBanner ? {} : { companyId }),
      },
    });

    if (existing) {
      await adRepo.update(
        { id: existing.id },
        {
          ...data,
          startDate,
          endDate,
          approvedAt: new Date(),
          isActive: true,
        },
      );
      continue;
    }

    await adRepo.save({
      companyId,
      positionId: null,
      ...data,
      startDate,
      endDate,
      approvedAt: new Date(),
      isActive: true,
      clicksCount: 0,
      payload: null,
      rejectedReason: null,
    });
  }
}
