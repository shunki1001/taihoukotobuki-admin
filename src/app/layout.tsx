import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css"; // Tailwind CSS のグローバルスタイル

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Webサイト", // プロジェクトに合わせて変更
  description: "Webサイトの説明", // プロジェクトに合わせて変更
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={inter.className}>
        {/* NextAuth.js の SessionProvider などをここに配置 */}
        {children}
      </body>
    </html>
  );
}