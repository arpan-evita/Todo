import type { Metadata } from "next";
import "../styles/globals.css";

export const metadata: Metadata = {
  title: "AutogrowX: Mission Control",
  description: "Gamified Execution System for High-Performance Operatives",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
