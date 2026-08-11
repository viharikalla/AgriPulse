export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  DASHBOARD: '/dashboard',
  ANALYZE: '/analyze',
  ADVISORY_DETAIL: '/advisory/:id',
  HISTORY: '/history',
  HISTORY_DETAIL: '/history/:id',
} as const;

export function getAdvisoryDetailPath(id: string): string {
  return `/advisory/${id}`;
}

export function getHistoryDetailPath(id: string): string {
  return `/history/${id}`;
}
