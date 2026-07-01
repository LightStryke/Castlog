import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import FishBackground from "./components/FishBackground";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "CastLog",
  description: "The angler's arena",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <FishBackground />
        <div className="relative z-10">
          {children}
        </div>
      </body>
    </html>
  );
}