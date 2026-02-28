import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { getCurrentPeriodId } from "./lib/period";

export default async function Home() {
  const user = await getCurrentUser();
  console.log("Current user:", user.settings);
  const startDay = user.settings?.startDay ?? 1;
  const currentPeriodId = getCurrentPeriodId(startDay);
  redirect(`/period/${currentPeriodId}`);
}
