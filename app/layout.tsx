import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tax Elevate — Smart Business Accounting",
  description: "Client demo for Tax Elevate",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}