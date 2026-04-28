export interface PaginationParams {
  page: number
  limit: number
}

export interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  hasMore: boolean
}

export function paginate<T>(
  data: T[],
  total: number,
  { page, limit }: PaginationParams
): PaginatedResult<T> {
  return {
    data,
    total,
    page,
    hasMore: (page - 1) * limit + data.length < total,
  }
}
