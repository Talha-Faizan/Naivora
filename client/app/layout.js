import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Naivora | Elegance in every thread.",
  description: "Where street culture meets everyday elegance. Discover premium quality materials, bold cuts, and honest comfort designed to define your identity.",
  icons: {
    icon: "/logo.png",
  },
};

import ConditionalLayout from "@/Components/Common/ConditionalLayout";
import { AuthProvider } from "../context/AuthContext";
import { CartProvider } from "../context/CartContext";
import LenisProvider from "@/Components/Common/LenisProvider";

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    >
      <body className="flex flex-col overflow-x-hidden" suppressHydrationWarning>
        <LenisProvider>
          <AuthProvider>
            <CartProvider>
              <ConditionalLayout>
                {children}
              </ConditionalLayout>
            </CartProvider>
          </AuthProvider>
        </LenisProvider>
      </body>
    </html>
  );
}
