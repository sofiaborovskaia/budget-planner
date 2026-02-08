interface DataCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
}

export function DataCard({ label, value, icon }: DataCardProps) {
  return (
    <div className="rounded-lg p-6 shadow-md transition-shadow hover:shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-2">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        {icon && <div className="ml-4 text-3xl text-gray-400">{icon}</div>}
      </div>
    </div>
  );
}
