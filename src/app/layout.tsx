import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DealFox — décider avec les preuves",
  description: "Copilote local de décision d’achat.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="fr"><body>{children}</body></html>;
}
