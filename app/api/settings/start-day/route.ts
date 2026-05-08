"use server";

import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    const { startDay } = await request.json();

    // Validate
    if (
      typeof startDay !== "number" ||
      startDay < 1 ||
      startDay > 31 ||
      !Number.isInteger(startDay)
    ) {
      return NextResponse.json(
        { error: "Invalid start day. Must be between 1 and 31." },
        { status: 400 },
      );
    }

    // Update or create user settings
    const existingSettings = await prisma.userSettings.findUnique({
      where: { userId: user.id },
    });

    if (existingSettings) {
      await prisma.userSettings.update({
        where: { userId: user.id },
        data: { startDay },
      });
    } else {
      await prisma.userSettings.create({
        data: {
          userId: user.id,
          startDay,
          periodType: "CUSTOM",
        },
      });
    }

    // Revalidate all period pages
    revalidatePath("/", "layout");

    return NextResponse.json({ success: true, startDay });
  } catch (error) {
    console.error("Error updating start day:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 },
    );
  }
}
