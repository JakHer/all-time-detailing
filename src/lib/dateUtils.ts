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

export function parseInputDate(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day, 12, 0, 0, 0);
}

export function shiftDateByDays(dateString: string, days: number): string {
  const nextDate = parseInputDate(dateString);
  nextDate.setDate(nextDate.getDate() + days);
  return formatDateForInput(nextDate);
}

export function shiftDateByMonths(dateString: string, months: number): string {
  const nextDate = parseInputDate(dateString);
  nextDate.setMonth(nextDate.getMonth() + months);
  return formatDateForInput(nextDate);
}

export function getStartOfWeek(dateString: string): string {
  const date = parseInputDate(dateString);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  return formatDateForInput(date);
}

export function getWeekDateStrings(dateString: string): string[] {
  const weekStart = parseInputDate(getStartOfWeek(dateString));
  return Array.from({ length: 7 }, (_, index) => {
    const nextDate = new Date(weekStart);
    nextDate.setDate(weekStart.getDate() + index);
    return formatDateForInput(nextDate);
  });
}

export function getMonthMatrix(dateString: string): string[][] {
  const anchorDate = parseInputDate(dateString);
  const monthStart = new Date(
    anchorDate.getFullYear(),
    anchorDate.getMonth(),
    1,
    12,
    0,
    0,
    0,
  );
  const monthStartDay = monthStart.getDay();
  const offset = monthStartDay === 0 ? -6 : 1 - monthStartDay;
  const gridStart = new Date(monthStart);
  gridStart.setDate(monthStart.getDate() + offset);
  const monthEnd = new Date(
    anchorDate.getFullYear(),
    anchorDate.getMonth() + 1,
    0,
    12,
    0,
    0,
    0,
  );
  const monthEndDay = monthEnd.getDay();
  const trailingDays = monthEndDay === 0 ? 0 : 7 - monthEndDay;
  const gridEnd = new Date(monthEnd);
  gridEnd.setDate(monthEnd.getDate() + trailingDays);
  const weeks =
    Math.floor(
      (gridEnd.getTime() - gridStart.getTime()) / (1000 * 60 * 60 * 24 * 7),
    ) + 1;

  return Array.from({ length: weeks }, (_, weekIndex) =>
    Array.from({ length: 7 }, (_, dayIndex) => {
      const nextDate = new Date(gridStart);
      nextDate.setDate(gridStart.getDate() + weekIndex * 7 + dayIndex);
      return formatDateForInput(nextDate);
    }),
  );
}

export function isSameMonth(leftDateString: string, rightDateString: string) {
  const leftDate = parseInputDate(leftDateString);
  const rightDate = parseInputDate(rightDateString);

  return (
    leftDate.getFullYear() === rightDate.getFullYear() &&
    leftDate.getMonth() === rightDate.getMonth()
  );
}

export function formatWeekdayLabel(
  dateString: string,
  options: Intl.DateTimeFormatOptions = {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
  },
) {
  return new Intl.DateTimeFormat('pl-PL', options).format(
    parseInputDate(dateString),
  );
}

export function formatMonthLabel(dateString: string) {
  return new Intl.DateTimeFormat('pl-PL', {
    month: 'long',
    year: 'numeric',
  }).format(parseInputDate(dateString));
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
