"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/app/components/ui/Button";
import { PresetButton } from "@/app/components/ui/PresetButton";
import { PeriodPreviewCard } from "@/app/components/profile/PeriodPreviewCard";
import { updateUserProfile } from "@/lib/actions/user";
import { getPeriod } from "@/app/lib/period";

// Constants for special start day values
const LAST_DAY_OF_MONTH = "last" as const;
const CUSTOM_DAY = "custom" as const;

interface ProfileFormProps {
  initialData: {
    name: string;
    email: string;
    startDay: number;
  };
}

export function ProfileForm({ initialData }: ProfileFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  // Determine initial state based on startDay
  const isPresetDay = initialData.startDay === 1 || initialData.startDay === 15;
  const [startDay, setStartDay] = useState<
    number | typeof LAST_DAY_OF_MONTH | typeof CUSTOM_DAY
  >(isPresetDay ? initialData.startDay : CUSTOM_DAY);
  const [customDay, setCustomDay] = useState<number>(
    !isPresetDay ? initialData.startDay : 27,
  );
  const [showCustomInput, setShowCustomInput] = useState(!isPresetDay);

  // State for period previews from API
  const [currentPeriodPreview, setCurrentPeriodPreview] = useState<{
    startDate: Date;
    endDate: Date;
    name: string;
  } | null>(null);
  const [nextPeriodPreview, setNextPeriodPreview] = useState<{
    startDate: Date;
    endDate: Date;
    name: string;
  } | null>(null);
  const [followingPeriodPreview, setFollowingPeriodPreview] = useState<{
    startDate: Date;
    endDate: Date;
    name: string;
  } | null>(null);

  // Calculate effective start day for API call
  const effectiveStartDay =
    startDay === LAST_DAY_OF_MONTH
      ? 28
      : startDay === CUSTOM_DAY
        ? customDay
        : startDay;

  // Fetch period previews whenever start day changes
  useEffect(() => {
    const fetchPeriods = async () => {
      try {
        const response = await fetch(
          `/api/preview-next-period?newDay=${effectiveStartDay}`,
        );
        if (response.ok) {
          const data = await response.json();

          // Use actual dates from API (handles bridge periods correctly)
          const nextStart = new Date(data.startDate);
          const nextEnd = new Date(data.endDate);
          const period = getPeriod(data.periodId);

          setNextPeriodPreview({
            startDate: nextStart,
            endDate: nextEnd,
            name: period.name || data.periodId,
          });

          // If there's a following period (after bridge), show it too
          if (data.followingPeriodId) {
            const followingStart = new Date(data.followingStartDate);
            const followingEnd = new Date(data.followingEndDate);
            const followingPeriod = getPeriod(data.followingPeriodId);

            setFollowingPeriodPreview({
              startDate: followingStart,
              endDate: followingEnd,
              name: followingPeriod.name || data.followingPeriodId,
            });
          } else {
            setFollowingPeriodPreview(null);
          }

          // Also show current period if available
          if (data.currentPeriodId) {
            const currentPeriod = getPeriod(data.currentPeriodId);
            setCurrentPeriodPreview({
              startDate: currentPeriod.startDate,
              endDate: currentPeriod.endDate,
              name: currentPeriod.name || data.currentPeriodId,
            });
          }
        }
      } catch (error) {
        console.error("Failed to fetch period preview:", error);
      }
    };

    fetchPeriods();
  }, [effectiveStartDay]);

  const getStartDayDescription = () => {
    if (startDay === 1) {
      return "Your budget periods will start on the first day of each month and end on the last day.";
    }

    if (startDay === LAST_DAY_OF_MONTH) {
      return "Your budget periods will start on the last day of each month.";
    }

    // For all numeric days (including 15 and custom day values)
    return `Your budget periods will start on day ${effectiveStartDay} and end on day ${effectiveStartDay - 1} of the following month.`;
  };

  // Detect if the next period is a transition/bridge period
  const getTransitionInfo = () => {
    if (!nextPeriodPreview) return null;

    const daysDifference =
      Math.ceil(
        (nextPeriodPreview.endDate.getTime() -
          nextPeriodPreview.startDate.getTime()) /
          (1000 * 60 * 60 * 24),
      ) + 1;

    const isUnusualLength = daysDifference < 28 || daysDifference > 31;
    const isChangingStartDay = effectiveStartDay !== initialData.startDay;

    if (isUnusualLength) {
      return {
        isTransition: true,
        days: daysDifference,
        message: isChangingStartDay
          ? `To avoid gaps in tracking, we'll create a short bridge period from your current schedule to the new one.`
          : `This is a bridge period to transition from your previous schedule.`,
      };
    }

    return null;
  };

  const getOrdinalSuffix = (day: number) => {
    if (day >= 11 && day <= 13) return "th";
    const lastDigit = day % 10;
    if (lastDigit === 1) return "st";
    if (lastDigit === 2) return "nd";
    if (lastDigit === 3) return "rd";
    return "th";
  };

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    setMessage("");

    try {
      const name = formData.get("name") as string;
      const email = formData.get("email") as string;

      await updateUserProfile(name, email);

      // Save start day if changed
      const finalStartDay = startDay === CUSTOM_DAY ? customDay : startDay;
      const hasChanged =
        (typeof finalStartDay === "number" &&
          finalStartDay !== initialData.startDay) ||
        finalStartDay === LAST_DAY_OF_MONTH;

      if (hasChanged) {
        const response = await fetch("/api/settings/start-day", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ startDay: finalStartDay }),
        });

        if (!response.ok) {
          throw new Error("Failed to update start day");
        }

        // Redirect to homepage, which will redirect to actual current period from DB
        router.push("/");
      } else {
        setMessage("Profile updated successfully!");
      }
    } catch (error) {
      setMessage("Failed to update profile. Please try again.");
      console.error("Profile update error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form action={handleSubmit} className="space-y-8">
      {/* Personal Information */}
      <section>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Personal Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="name" className="block text-sm mb-2">
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              defaultValue={initialData.name}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your name"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              defaultValue={initialData.email}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your email"
            />
          </div>
        </div>
      </section>

      {/* Budget Preferences */}
      <section>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Budget Preferences
        </h2>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            What day of the month do you get paid?
          </label>

          <div className="flex flex-wrap gap-2 items-end mb-4">
            <PresetButton
              label="1st"
              isSelected={startDay === 1}
              onClick={() => {
                setStartDay(1);
                setShowCustomInput(false);
              }}
            />
            <PresetButton
              label="15th"
              isSelected={startDay === 15}
              onClick={() => {
                setStartDay(15);
                setShowCustomInput(false);
              }}
            />
            <PresetButton
              label="Last day"
              isSelected={startDay === LAST_DAY_OF_MONTH}
              onClick={() => {
                setStartDay(LAST_DAY_OF_MONTH);
                setShowCustomInput(false);
              }}
            />
            <PresetButton
              label="Custom"
              isSelected={startDay === CUSTOM_DAY}
              onClick={() => {
                setStartDay(CUSTOM_DAY);
                setShowCustomInput(true);
              }}
            />
            <div
              className="flex flex-col gap-1 transition-opacity duration-200"
              style={{
                opacity: showCustomInput ? 1 : 0,
                pointerEvents: showCustomInput ? "auto" : "none",
              }}
              aria-hidden={!showCustomInput}
            >
              <label htmlFor="customDay" className="text-xs text-grey">
                Day of month:
              </label>
              <input
                type="number"
                id="customDay"
                min="1"
                max="31"
                value={customDay}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (val >= 1 && val <= 31) {
                    setCustomDay(val);
                  }
                }}
                disabled={!showCustomInput}
                className="w-20 px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2"
              />
            </div>
          </div>

          <p className="text-sm mb-4">{getStartDayDescription()}</p>

          {/* Live Preview */}
          <div
            className="rounded-lg p-6"
            style={{
              backgroundColor: "var(--off-white)",
              borderColor: "var(--grey-600)",
            }}
          >
            {nextPeriodPreview ? (
              <>
                {currentPeriodPreview && (
                  <div className="mb-4">
                    <span
                      className="text-sm font-semibold mb-2 block"
                      style={{ color: "var(--grey-900)" }}
                    >
                      Current period:
                    </span>
                    <PeriodPreviewCard
                      title={currentPeriodPreview.name}
                      startDate={currentPeriodPreview.startDate}
                      endDate={currentPeriodPreview.endDate}
                    />
                  </div>
                )}

                {/* Transition Period */}
                {getTransitionInfo() && (
                  <>
                    <div className="mb-4">
                      <span
                        className="text-sm font-semibold mb-2 block"
                        style={{ color: "var(--grey-900)" }}
                      >
                        Transition period:
                      </span>
                      <PeriodPreviewCard
                        title={nextPeriodPreview.name}
                        startDate={nextPeriodPreview.startDate}
                        endDate={nextPeriodPreview.endDate}
                      />
                      <div
                        className="mt-2 p-3 rounded text-sm"
                        style={{
                          backgroundColor: "rgba(255, 113, 68, 0.1)",
                          color: "var(--grey-900)",
                          border: "1px solid var(--orange)",
                        }}
                      >
                        <strong>
                          ⚠️ {getTransitionInfo()?.days}-day bridge period:
                        </strong>{" "}
                        {getTransitionInfo()?.message}
                      </div>
                    </div>

                    {/* Following Regular Period */}
                    {followingPeriodPreview && (
                      <div>
                        <span
                          className="text-sm font-semibold mb-2 block"
                          style={{ color: "var(--grey-900)" }}
                        >
                          Following period:
                        </span>
                        <PeriodPreviewCard
                          title={followingPeriodPreview.name}
                          startDate={followingPeriodPreview.startDate}
                          endDate={followingPeriodPreview.endDate}
                        />
                      </div>
                    )}
                  </>
                )}

                {/* Normal Next Period */}
                {!getTransitionInfo() && (
                  <>
                    <span
                      className="text-sm font-semibold mb-2 block"
                      style={{ color: "var(--grey-900)" }}
                    >
                      Next period:
                    </span>
                    <PeriodPreviewCard
                      title={nextPeriodPreview.name}
                      startDate={nextPeriodPreview.startDate}
                      endDate={nextPeriodPreview.endDate}
                    />
                  </>
                )}
              </>
            ) : (
              <div className="text-sm text-gray-500">Loading preview...</div>
            )}
          </div>
        </div>
      </section>

      {/* Save Button */}
      <div className="pt-4 space-y-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Changes"}
        </Button>
        {message && <p className="text-sm">{message}</p>}
      </div>
    </form>
  );
}
