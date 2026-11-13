import CarteInteractive from "@/components/CarteInteractive";

// MapIntel : la carte mondiale des cyberattaques est la page d'accueil.
export default function Accueil() {
  return (
    <>
      {/* Barre du haut, fixe : nom du projet et sources des données */}
      <header className="flex h-14 items-center justify-between border-b border-bordure bg-fond px-4">
        <div className="flex items-center gap-2 font-semibold">
          <span className="size-2.5 rounded-full bg-red-500" aria-hidden="true" />
          MapIntel
          <span className="font-normal text-texte-discret">· carte des cyberattaques</span>
        </div>
        <p className="hidden text-xs text-texte-discret md:block">
          ransomware.live · AlienVault OTX · MISP Galaxy
        </p>
      </header>

      {/* La carte remplit le reste de l'écran : hauteur totale moins la barre du haut (3.5rem = 56 px) */}
      <main className="h-[calc(100dvh-3.5rem)] w-full bg-zinc-950">
        <CarteInteractive />
      </main>
    </>
  );
}
