import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LensReport | ForgePulse",
  description: "Embeddable visual feedback and bug reporting for product teams.",
  metadataBase: new URL("https://lensreport.store"),
  icons: {
    icon: [
      { url: "/icon.svg?v=lensreport-20260425", type: "image/svg+xml" },
    ],
    shortcut: "/icon.svg?v=lensreport-20260425",
    apple: "/icon.svg?v=lensreport-20260425",
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
        <I18nProvider>
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}
