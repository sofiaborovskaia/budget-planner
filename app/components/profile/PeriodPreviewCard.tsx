interface PeriodPreviewCardProps {
  title: string;
  startDate: Date;
  endDate: Date;
}

export function PeriodPreviewCard({
  title,
  startDate,
  endDate,
}: PeriodPreviewCardProps) {
  const formatPeriodDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    });
  };

  return (
    <div
      className="flex items-center gap-3 py-2 px-3 bg-white rounded"
      style={{ borderColor: "var(--grey-600)" }}
    >
      <div
        className="w-2 h-2 rounded-full"
        style={{
          backgroundColor: "var(--grey-600)",
        }}
      ></div>
      <div className="flex-1">
        <div
          className="text-sm font-medium"
          style={{ color: "var(--grey-900)" }}
        >
          {title}
        </div>
        <div className="text-sm text-grey">
          {formatPeriodDate(startDate)} → {formatPeriodDate(endDate)}
        </div>
      </div>
    </div>
  );
}
