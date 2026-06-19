import type { Metadata } from "next";
import { appConfig } from "@/app.config";
import "./globals.css";

export const metadata: Metadata = {
  title: `${appConfig.name} — ${appConfig.series}`,
  description: appConfig.description,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
