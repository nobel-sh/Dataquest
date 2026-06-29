import type { Metadata } from "next";
import { StatusBubbleProvider } from "@/components/status-bubble";
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
      <body>
        <StatusBubbleProvider>{children}</StatusBubbleProvider>
      </body>
    </html>
  );
}
