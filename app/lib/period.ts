export interface Period {
  id: string; // Format: "2026-02-05" (based on start date)
  startDate: Date;
  endDate: Date;
  lengthInDays: number; // Auto-calculated
  monthName: string;
}

/**
 * For now, assumes periods start on the 5th of each month
 * Later this can be customized per user from database
 */
const DEFAULT_PAY_DAY = 5;

/**
 * Calculate the length in days between two dates
 */
function calculateDaysBetween(start: Date, end: Date): number {
  const diffTime = end.getTime() - start.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Get period ID from start date (format: "2026-02-05")
 */
export function getPeriodId(startDate: Date): string {
  const year = startDate.getFullYear();
  const month = String(startDate.getMonth() + 1).padStart(2, "0");
  const day = String(startDate.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Parse period ID to get year, month, and day
 */
export function parsePeriodId(periodId: string): {
  year: number;
  month: number;
  day: number;
} {
  const [year, month, day] = periodId.split("-").map(Number);
  return { year, month, day };
}

/**
 * Get the current period ID based on today's date
 */
export function getCurrentPeriodId(): string {
  const today = new Date();
  const currentPeriodStart = getCurrentPeriodStartDate(today);
  return getPeriodId(currentPeriodStart);
}

/**
 * Calculate the start date of the period that contains the given date
 */
function getCurrentPeriodStartDate(date: Date): Date {
  const year = date.getFullYear();
  const month = date.getMonth();

  // Current month's period start
  const thisMonthStart = new Date(year, month, DEFAULT_PAY_DAY);

  // If today is before this month's pay day, we're in previous period
  if (date < thisMonthStart) {
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    return new Date(prevYear, prevMonth, DEFAULT_PAY_DAY);
  }

  return thisMonthStart;
}

/**
 * Calculate period details with automatic lengthInDays
 */
export function getPeriod(periodId: string): Period {
  const { year, month, day } = parsePeriodId(periodId);

  // Start date: exact date from period ID
  const startDate = new Date(year, month - 1, day);

  // End date: day before next period starts
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;
  const nextPeriodStart = new Date(nextYear, nextMonth - 1, DEFAULT_PAY_DAY);
  const endDate = new Date(nextPeriodStart);
  endDate.setDate(endDate.getDate() - 1);

  // Auto-calculate length
  const lengthInDays = calculateDaysBetween(startDate, endDate) + 1; // +1 to include both start and end

  // Format month name (keeping this for display purposes)
  const monthName = startDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return {
    id: periodId,
    startDate,
    endDate,
    lengthInDays,
    monthName,
  };
}

/**
 * Get the previous period ID
 */
export function getPreviousPeriodId(periodId: string): string {
  const { year, month, day } = parsePeriodId(periodId);
  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;
  const prevPeriodStart = new Date(prevYear, prevMonth - 1, DEFAULT_PAY_DAY);
  return getPeriodId(prevPeriodStart);
}

/**
 * Get the next period ID
 */
export function getNextPeriodId(periodId: string): string {
  const { year, month, day } = parsePeriodId(periodId);
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;
  const nextPeriodStart = new Date(nextYear, nextMonth - 1, DEFAULT_PAY_DAY);
  return getPeriodId(nextPeriodStart);
}

/**
 * Calculate days remaining in period
 */
export function getDaysRemaining(period: Period): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (today > period.endDate) return 0;
  if (today < period.startDate) return period.lengthInDays;

  return calculateDaysBetween(today, period.endDate) + 1;
}

/**
 * Format date for display
 */
export function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}
