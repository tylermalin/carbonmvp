import type { Metadata } from "next";
import "./globals.css";
import TopNavigation from "./components/TopNavigation";

export const metadata: Metadata = {
  title: "Malama CO2.0 - Universal Carbon Market Operating System",
  description: "Streamlined carbon project development and DMRV platform",
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <TopNavigation />
        {children}
      </body>
    </html>
  );
}

