import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dataquest Forms",
  description: "Dynamic form rendering for Dataquest schemas",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
