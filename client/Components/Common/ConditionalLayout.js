"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/Components/Common/Navbar";
import Footer from "@/Components/Common/Footer";
import SmoothScroll from "@/Components/Common/SmoothScroll";

export default function ConditionalLayout({ children }) {
  const pathname = usePathname();

  // Pages where Navbar and Footer should NOT show
  const noNavFooterPages = ["/login"];
  const isNoNavFooter = noNavFooterPages.includes(pathname);

  // Pages where Footer should NOT show
  const noFooterPages = ["/cart", "/dashboard", "/customer-dashboard"];
  const isNoFooter = isNoNavFooter || noFooterPages.some(page => pathname.startsWith(page)) || pathname.includes("dashboard");

  return (
    <SmoothScroll>
      {!isNoNavFooter && <Navbar />}
      {children}
      {!isNoFooter && <Footer />}
    </SmoothScroll>
  );
}
