/**
 * Centralized date management for the application.
 * Currently defaults to 2026-04-08 to match demo data.
 */

const DEMO_DATE = '2026-04-08';

export function getTodayDateString(): string {
  // In a real app, this would return new Date().toISOString().split('T')[0]
  // but for the demo we use the fixed date.
  return DEMO_DATE;
}

export function formatShortDate(dateString: string): string {
  const parts = dateString.split('-');
  return `${parts[2]}.${parts[1]}`;
}

export function getStartAndEndOfDay(dateString: string) {
  return {
    start: `${dateString}T00:00:00Z`,
    end: `${dateString}T23:59:59Z`,
  };
}
