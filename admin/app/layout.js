import "./globals.css";
import { AdminAuthProvider } from "../context/AdminAuthContext";

export const metadata = {
  title: "Naivora Admin",
  description: "Admin panel for Naivora",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Jost:ital,wght@0,100..900;1,100..900&family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased min-h-screen para" suppressHydrationWarning>
        <AdminAuthProvider>{children}</AdminAuthProvider>
      </body>
    </html>
  );
}
