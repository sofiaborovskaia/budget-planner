import { LineItemCategory, PeriodType } from "@prisma/client";

import { prisma } from "../lib/prisma";

async function main() {
  const user = await prisma.user.upsert({
    where: { email: "sofi.power@example.com" },
    update: {},
    create: {
      email: "sofi.power@example.com",
      name: "Sofi Power",
      settings: {
        create: {
          periodType: PeriodType.MONTHLY,
          startDay: 27,
        },
      },
    },
  });

  const periodStart = new Date("2026-01-27");
  const periodEnd = new Date("2026-02-26");

  let period = await prisma.period.findFirst({
    where: {
      userId: user.id,
      startDate: periodStart,
    },
  });

  if (!period) {
    period = await prisma.period.create({
      data: {
        userId: user.id,
        name: "Jan 27 - Feb 26 2026",
        startDate: periodStart,
        endDate: periodEnd,
      },
    });
  }

  await prisma.lineItem.deleteMany({
    where: {
      userId: user.id,
      periodId: period.id,
    },
  });

  const expenseItems = [
    { title: "Coffee & Treats", amount: 45.5, paid: true },
    { title: "Groceries", amount: 180, paid: true },
    { title: "Transport", amount: 65, paid: false },
  ].map((item) => ({
    ...item,
    category: LineItemCategory.EXPENSE,
  }));

  const fixedCostItems = [
    { title: "Rent", amount: 1200, paid: true },
    { title: "Wi-Fi", amount: 60, paid: false },
    { title: "Health Insurance", amount: 220, paid: false },
  ].map((item) => ({
    ...item,
    category: LineItemCategory.FIXED_COST,
  }));

  const nonNegotiableItems = [
    { title: "Gym Membership", amount: 50, paid: true },
    { title: "Therapy", amount: 90, paid: false },
    { title: "Language Course", amount: 110, paid: false },
  ].map((item) => ({
    ...item,
    category: LineItemCategory.NON_NEGOTIABLE,
  }));

  const lineItems = [
    ...expenseItems,
    ...fixedCostItems,
    ...nonNegotiableItems,
  ].map((item) => ({
    ...item,
    userId: user.id,
    periodId: period!.id,
  }));

  await prisma.lineItem.createMany({
    data: lineItems,
  });

  await prisma.income.deleteMany({
    where: {
      userId: user.id,
      periodId: period.id,
    },
  });

  await prisma.income.create({
    data: {
      userId: user.id,
      periodId: period.id,
      amount: 3100,
    },
  });

  console.log("Seed complete for Sofi Power ✔");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
