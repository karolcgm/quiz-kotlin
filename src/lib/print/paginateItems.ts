/** Deterministyczny podział zadań na strony A4 (spec §33 — bez losowości) */

export function paginateItems<T>(items: T[], perPage: number): T[][] {
  if (perPage < 1 || items.length === 0) return [items];
  const pages: T[][] = [];
  for (let i = 0; i < items.length; i += perPage) {
    pages.push(items.slice(i, i + perPage));
  }
  return pages;
}

export const PRINT_ITEMS_PER_PAGE = 5;
