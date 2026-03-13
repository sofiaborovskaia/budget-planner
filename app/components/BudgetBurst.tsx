"use client";

interface BudgetBurstProps {
  value: string;
}

export function BudgetBurst({ value }: BudgetBurstProps) {
  // Generate points for a multi-pointed star
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

  const points = generateStarPoints(200, 200, 24, 190, 150);

  return (
    <div className="relative flex items-center justify-center w-full h-full">
      {/* SVG Star Shape */}
      <svg
        width="400"
        height="400"
        viewBox="0 0 400 400"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute"
      >
        <defs>
          <radialGradient id="burstGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--off-white)" />
            <stop offset="90%" stopColor="var(--white)" />
          </radialGradient>
        </defs>
        <polygon
          points={points}
          fill="url(#burstGradient)"
          stroke="black"
          strokeWidth="1"
        />
      </svg>

      {/* Text Content */}
      <div className="absolute flex flex-col items-center justify-center">
        <p
          className="text-base mb-2"
          style={{ fontFamily: "var(--font-nunito)", color: "#666" }}
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
