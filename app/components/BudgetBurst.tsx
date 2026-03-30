"use client";

// Generate points for a multi-pointed star (calculated once at module load)
const generateStarPoints = (
  centerX: number,
  centerY: number,
  points: number,
  outerRadius: number,
  innerRadius: number,
) => {
  const angle = Math.PI / points;
  const coords: string[] = [];

  for (let i = 0; i < 2 * points; i++) {
    const r = i % 2 === 0 ? outerRadius : innerRadius;
    const currAngle = i * angle - Math.PI / 2;
    const x = centerX + r * Math.cos(currAngle);
    const y = centerY + r * Math.sin(currAngle);
    coords.push(`${x},${y}`);
  }

  return coords.join(" ");
};

// Pre-calculate the star points once
const STAR_POINTS = generateStarPoints(200, 200, 24, 190, 150);

interface BudgetBurstProps {
  value: string;
}

export function BudgetBurst({ value }: BudgetBurstProps) {
  return (
    <div
      className="flex items-center justify-center"
      style={{ maxWidth: "400px", marginInline: "auto" }}
    >
      {/* SVG Star Shape */}
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 400 400"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="burstGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--green)" />
            <stop offset="90%" stopColor="var(--white)" />
          </radialGradient>
        </defs>
        <polygon
          points={STAR_POINTS}
          fill="url(#burstGradient)"
          stroke="black"
          strokeWidth="1"
          suppressHydrationWarning
        />
      </svg>

      {/* Text Content */}
      <div className="absolute flex flex-col items-center justify-center">
        <p
          className="text-base mb-2"
          style={{ fontFamily: "var(--font-nunito)", color: "var(--grey-600)" }}
        >
          Budget per Day
        </p>
        <p
          className="text-4xl font-bold"
          style={{ fontFamily: "var(--font-instrument-serif)" }}
        >
          {value}
        </p>
      </div>
    </div>
  );
}
