import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { getActualCurrentPeriodId } from "@/lib/queries";

export default async function Home() {
  const user = await getCurrentUser();
  const startDay = user.settings?.startDay ?? 1;

  const currentPeriodId = await getActualCurrentPeriodId(user.id, startDay);

  redirect(`/period/${currentPeriodId}`);
}
