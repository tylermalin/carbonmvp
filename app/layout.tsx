import type { Metadata } from "next";
import "./globals.css";
import TopNavigation from "./components/TopNavigation";

export const metadata: Metadata = {
  title: "Malama CO2.0 - Universal Carbon Market Operating System",
  description: "Streamlined carbon project development and DMRV platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        <TopNavigation />
        {children}
      </body>
    </html>
  );
}

