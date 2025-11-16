import type { Metadata } from "next";
import "./globals.css";
import Navigation from "@/components/Navigation";

export const metadata: Metadata = {
  title: "Easy Book - AI Calendar Booking",
  description: "Convert natural language commands into Google Calendar bookings",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="antialiased bg-gray-50">
        <Navigation />
        {children}
      </body>
    </html>
  );
}

