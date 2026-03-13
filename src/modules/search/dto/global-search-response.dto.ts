export class GlobalSearchItemDto {
  id: string | number;
  title: string;
}

export class GlobalSearchResponseDto {
  companies: GlobalSearchItemDto[];
  news: GlobalSearchItemDto[];
  blogs: GlobalSearchItemDto[];
  orders: GlobalSearchItemDto[];
  contests: GlobalSearchItemDto[];
}
