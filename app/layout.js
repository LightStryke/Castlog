import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import FishBackground from "./components/FishBackground";
import NavBar from "./components/NavBar";

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
        <NavBar />
        <div className="relative z-10 pt-16">
          {children}
        </div>
      </body>
    </html>
  );
}