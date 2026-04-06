export type PaginatedResponse<T> = {
  items: T[];
  total: number;
  current_page: number;
  per_page: number;
  last_page: number;
};
