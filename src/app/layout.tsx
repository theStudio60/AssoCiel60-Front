import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from '@/contexts/LanguageContext';

const poppins = Poppins({
  weight: ['300', '400', '500', '600', '700', '800'],
  subsets: ["latin"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "Alprail",
  description: "Plateforme d'adhésion Alprail",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={`${poppins.variable} font-poppins antialiased`}>
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}