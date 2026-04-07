import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "GateKeeper Layer 2",
  description: "Wave 2 — Universal Login, live auth truth, and frozen feed contract."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body>{children}</body>
    </html>
  );
}
