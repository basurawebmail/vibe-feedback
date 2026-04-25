import type { Metadata } from "next";
import "./globals.css";
import AnimatedBackground from "@/components/AnimatedBackground";

export const metadata: Metadata = {
  title: "LensReport | ForgePulse",
  description: "Embeddable visual feedback and bug reporting for product teams.",
  metadataBase: new URL("https://lensreport.store"),
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
  alternates: {
    canonical: "/",
  },
};

import { I18nProvider } from "@/lib/i18n";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans bg-background text-foreground">
        <AnimatedBackground />
        <I18nProvider>
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}
