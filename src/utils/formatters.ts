export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-IN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return dateString;
  }
}

export function formatPercent(value: number): string {
  return `${Math.round(value)}%`;
}

export function formatConfidence(score: number): string {
  return `${Math.round(score * 100)}% Confidence`;
}
