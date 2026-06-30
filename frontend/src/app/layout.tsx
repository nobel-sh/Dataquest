import type { Metadata } from "next";
import { IBM_Plex_Sans, Newsreader } from "next/font/google";
import { StatusBubbleProvider } from "@/components/status-bubble";
import "./globals.css";

const bodyFont = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
});

const displayFont = Newsreader({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
});

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
    <html className={`${bodyFont.variable} ${displayFont.variable}`} lang="en">
      <body>
        <StatusBubbleProvider>{children}</StatusBubbleProvider>
      </body>
    </html>
  );
}
