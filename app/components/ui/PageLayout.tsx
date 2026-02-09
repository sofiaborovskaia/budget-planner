interface PageLayoutProps {
  children: React.ReactNode;
  title: string;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "4xl";
}

export function PageLayout({
  children,
  title,
  maxWidth = "4xl",
}: PageLayoutProps) {
  const maxWidthClass = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "4xl": "max-w-4xl",
  }[maxWidth];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <main className={`${maxWidthClass} mx-auto px-4 sm:px-6 lg:px-8 py-12`}>
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold mb-6">{title}</h1>
          {children}
        </div>
      </main>
    </div>
  );
}
