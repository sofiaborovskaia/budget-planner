import type { Metadata } from "next";
import { TopNavigation } from "@/app/components/TopNavigation";
import { instrumentSerif, nunito, candal, calistoga } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Budget Planner",
  description:
    "A simple and intuitive budget planning app to help you manage your finances effectively.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${instrumentSerif.variable} ${nunito.variable} ${candal.variable} ${calistoga.variable} antialiased`}
      >
        <TopNavigation />
        {children}
      </body>
    </html>
  );
}
