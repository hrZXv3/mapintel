import { IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-sans",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
});

export const metadata = {
  title: "MapIntel — carte mondiale des cyberattaques",
  description: "Ransomware, phishing et groupes APT, pays par pays, à partir de sources publiques.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr" className={`${plexSans.variable} ${plexMono.variable}`}>
      <body className="bg-fond text-texte font-sans antialiased">
        {children}
      </body>
    </html>
  );
}