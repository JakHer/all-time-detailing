/**
 * Centralized date helpers for the application.
 */

export function getTodayDateString(): string {
  return formatDateForInput(new Date());
}

export function formatDateForInput(value: Date): string {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function formatShortDate(dateString: string): string {
  const parts = dateString.split('-');
  return `${parts[2]}.${parts[1]}`;
}

export function getStartAndEndOfDay(dateString: string) {
  const [year, month, day] = dateString.split('-').map(Number);
  const start = new Date(year, month - 1, day, 0, 0, 0, 0);
  const end = new Date(year, month - 1, day, 23, 59, 59, 999);

  return {
    start: start.toISOString(),
    end: end.toISOString(),
  };
}
