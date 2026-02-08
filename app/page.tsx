import { redirect } from "next/navigation";
import { getCurrentPeriodId } from "./lib/period";

export default function Home() {
  // Redirect to current period
  const currentPeriodId = getCurrentPeriodId();
  redirect(`/period/${currentPeriodId}`);
}
