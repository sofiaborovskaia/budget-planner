/**
 * Shared constants that mirror Prisma enums for use in client components.
 * These values are validated against Prisma types in Server Actions.
 */

export const CATEGORY = {
  EXPENSE: "EXPENSE",
  FIXED_COST: "FIXED_COST",
  NON_NEGOTIABLE: "NON_NEGOTIABLE",
} as const;

export type CategoryValue = (typeof CATEGORY)[keyof typeof CATEGORY];

export const PERIOD_TYPE = {
  MONTHLY: "MONTHLY",
  BIWEEKLY: "BIWEEKLY",
  CUSTOM: "CUSTOM",
} as const;

export type PeriodTypeValue = (typeof PERIOD_TYPE)[keyof typeof PERIOD_TYPE];

/**
 * Number of items to show per page in tables before "Show more" button appears.
 * Shared across all table components for consistent UX.
 */
export const ITEMS_PER_PAGE = 10;
