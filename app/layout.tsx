import type { Metadata } from "next";
import { TopNavigation } from "@/app/components/TopNavigation";
import { instrumentSerif, nunito, candal, calistoga } from "./fonts";
import { auth } from "@/auth";
import "./globals.css";

export const metadata: Metadata = {
  title: "Budget Planner",
  description:
    "A simple and intuitive budget planning app to help you manage your finances effectively.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Fetch authentication session on server side
  const session = await auth();

  return (
    <html lang="en">
      <body
        className={`${instrumentSerif.variable} ${nunito.variable} ${candal.variable} ${calistoga.variable} antialiased`}
      >
        <TopNavigation user={session?.user} />
        {children}
      </body>
    </html>
  );
}
