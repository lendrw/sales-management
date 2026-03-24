import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Supermarket",
  description: "",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br" className="">
      <body className="">{children}</body>
    </html>
  );
}
