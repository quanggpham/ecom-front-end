import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ProductDetailSheet } from "@/components/ecommerce/ProductDetailSheet";
import { useUIStore } from "@/store";

const beVietnamPro = Be_Vietnam_Pro({
  variable: "--font-sans",
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin", "vietnamese"],
});

export const metadata: Metadata = {
  title: "Bếp Việt - Đồ ăn Việt Nam truyền thống",
  description: "Website thương mại điện tử bán đồ ăn Việt Nam truyền thống. Phở, bánh mì, bún chả và nhiều món ăn ngon khác.",
  keywords: ["đồ ăn Việt Nam", "phở", "bánh mì", "bún chả", "thương mại điện tử", "food delivery"],
  authors: [{ name: "Bếp Việt Team" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "Bếp Việt - Đồ ăn Việt Nam truyền thống",
    description: "Khám phá hương vị món ăn Việt Nam truyền thống",
    type: "website",
    locale: "vi_VN",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body
        className={`${beVietnamPro.variable} font-sans antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
