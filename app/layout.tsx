import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "API Tester",
  description: "Test your APIs with ease",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
