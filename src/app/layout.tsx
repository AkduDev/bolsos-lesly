import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Carteras Lesly - Elegancia y Estilo",
  description: "Carteras artesanales confeccionadas con los mejores materiales. Cada pieza cuenta una historia de calidad y distinción.",
  keywords: ["carteras", "bolsos", "cuero", "moda", "elegancia", "artesanal", "Cuba", "La Habana"],
  authors: [{ name: "Carteras Lesly" }],
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/logo-profesional.jpg", sizes: "any" },
    ],
    apple: "/logo-profesional.jpg",
  },
  openGraph: {
    title: "Carteras Lesly - Elegancia y Estilo",
    description: "Carteras artesanales de alta calidad",
    url: "http://localhost:3000",
    siteName: "Carteras Lesly",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Carteras Lesly - Elegancia y Estilo",
    description: "Carteras artesanales de alta calidad",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${playfair.variable} ${inter.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: 'oklch(1 0 0)',
              border: '1px solid oklch(0.70 0.14 75 / 0.3)',
              color: 'oklch(0.20 0.02 50)',
            },
          }}
          richColors
        />
      </body>
    </html>
  );
}
