import type { Metadata } from "next";
import { DM_Sans, Amatic_SC } from "next/font/google";
import { brand } from "@/lib/brand";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

const amatic = Amatic_SC({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-amatic",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(brand.urls.site),
  title: {
    default: `Miniature Highland Cows for Sale | ${brand.name}`,
    template: `%s | ${brand.name}`,
  },
  description:
    "Buy miniature Highland cows and donkeys for small farms and homesteads. Browse available calves, review our health policy, and request a transport quote.",
  keywords: [
    "mini highland cows for sale",
    "miniature highland cattle",
    "mini cows for sale",
    "miniature donkeys for sale",
    "halter trained mini highland",
  ],
  icons: {
    icon: [{ url: "/favicon-32.png", sizes: "32x32", type: "image/png" }],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    siteName: brand.name,
    type: "website",
    locale: "en_US",
    title: `Miniature Highland Cows for Sale | ${brand.name}`,
    description:
      "Browse available miniature Highland calves and donkeys. Halter-trained stock with published health and shipping policies.",
    images: [{ url: "/logo.png", width: 512, height: 512, alt: brand.name }],
  },
  twitter: {
    card: "summary_large_image",
    title: `Miniature Highland Cows for Sale | ${brand.name}`,
    description:
      "Browse available miniature Highland calves and donkeys for small acreage and homestead life.",
    images: ["/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${dmSans.variable} ${amatic.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
