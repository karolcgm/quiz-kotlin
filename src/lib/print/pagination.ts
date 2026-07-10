import { paginateItems, PRINT_ITEMS_PER_PAGE } from "@/lib/print/paginateItems";
import type { PrintViewMode } from "@/types/print";

export function countPrintPages(itemCount: number, viewMode: PrintViewMode): number {
  const studentPages = paginateItems(Array.from({ length: itemCount }), PRINT_ITEMS_PER_PAGE).length;
  return studentPages + (viewMode === "key-separate" ? 1 : 0);
}
