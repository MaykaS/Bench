import { CloudGate } from "@/components/pairing/CloudGate";
import type { Metadata, Viewport } from "next";
import { Instrument_Sans } from "next/font/google";
import type { ReactNode } from "react";
import { NavShell } from "@/components/nav/NavShell";
import { getSession } from "@/lib/session/getSession";
import { SessionProvider } from "@/lib/session/SessionContext";
import { ACCENT_HEX } from "@/lib/theme";
import "./globals.css";

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument-sans",
});

export const metadata: Metadata = {
  title: "Bench",
  description: "A personal recruiting tracker.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Bench",
  },
  icons: {
    apple: "/icons/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: ACCENT_HEX,
};

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getSession();

  return (
    <html lang="en" className={instrumentSans.variable}>
      <body className="font-sans antialiased">
        <SessionProvider session={session}>
          <CloudGate><NavShell>{children}</NavShell></CloudGate>
        </SessionProvider>
      </body>
    </html>
  );
}
