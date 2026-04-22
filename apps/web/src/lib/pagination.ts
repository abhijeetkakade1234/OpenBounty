export function getTotalPages(total: number, pageSize: number) {
  return Math.max(1, Math.ceil(total / pageSize));
}

export function getCursorFromPage(page: number, pageSize: number) {
  return Math.max(0, (page - 1) * pageSize);
}
