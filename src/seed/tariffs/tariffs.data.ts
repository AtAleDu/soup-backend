import { Tariff } from "@entities/Tarif/tariff.entity";

export const TARIFF_DATA: Partial<Tariff>[] = [
  {
    name: "basic",
    price: 0,
    duration_days: null,
    features: {
      regions: 5,
      categories: 2,
      subcategories: 3,
      photos: 10,
      videos: 0,
    },
    is_active: false,
  },
  {
    name: "start",
    price: 5000,
    duration_days: 30,
    features: {
      regions: 5,
      categories: 2,
      subcategories: 3,
      photos: 10,
      videos: 0,
    },
    is_active: true,
  },
  {
    name: "business",
    price: 10000,
    duration_days: 30,
    features: {
      regions: 15,
      categories: 3,
      subcategories: 3,
      photos: 15,
      videos: 0,
    },
    is_active: true,
  },
  {
    name: "premium",
    price: 25000,
    duration_days: 30,
    features: {
      regions: 30,
      categories: 4,
      subcategories: 5,
      photos: 20,
      videos: 0,
    },
    is_active: true,
  },
  {
    name: "vip",
    price: 50000,
    duration_days: 30,
    features: {
      regions: "all",
      categories: "all",
      subcategories: "all",
      photos: 20,
      videos: 5,
    },
    is_active: true,
  },
];
