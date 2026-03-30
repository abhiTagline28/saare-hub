import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SareeHub - Saree Design Management",
  description: "Manage and share saree designs with your shopkeepers",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 antialiased">{children}</body>
    </html>
  );
}
