"use client";

import { useEffect, useState } from "react";
import { groupesApt } from "@/data/attaques";
import AptList from "@/components/AptList";

const onglets = [
  { cle: "entreprise", texte: "Entreprises" },
  { cle: "gouvernement", texte: "Gouvernement" },
  { cle: "apt", texte: "Groupes APT" },
];

// Couleur du badge selon le type d'attaque (les autres types, dans les exemples, restent en rouge).
const badges = {
  Phishing: "bg-sky-950 text-sky-300",
};

// Le panneau qui s'ouvre quand on clique sur un pays.
// Props : pays = { id, nom }, typesActifs = types cochés dans la barre,
//         secteur = secteur choisi ("tous" = pas de filtre), onClose = fonction pour fermer.
export default function SidePanel({ pays, typesActifs, secteur, onClose }) {
  // useState garde en mémoire l'onglet choisi. Quand on le change, React réaffiche le panneau.
  const [onglet, setOnglet] = useState("entreprise");
  // null = pas encore chargé ; ensuite { source, attaques }.
  const [donnees, setDonnees] = useState(null);

  // Au montage du panneau, on demande à NOTRE route serveur les victimes de ce pays.
  useEffect(() => {
    fetch(`/api/attaques?pays=${pays.id}`)
      .then((reponse) => reponse.json())
      .then(setDonnees)
      .catch(() => setDonnees({ sources: {}, attaques: [] }));
  }, [pays.id]);

  // On ne garde que les types cochés et le secteur choisi, puis on trie du plus récent au plus ancien.
  const attaquesDuPays = (donnees?.attaques ?? [])
    .filter((a) => typesActifs.includes(a.type))
    .filter((a) => secteur === "tous" || a.secteur === secteur)
    .sort((a, b) => b.date.localeCompare(a.date));
  const liste = attaquesDuPays.filter((a) => a.typeCible === onglet);

  // Les données d'exemple ont un id MITRE (apt), les vraies ont un nom de groupe (groupe).
  const nomGroupe = (a) => a.groupe ?? groupesApt.find((g) => g.id === a.apt)?.nom ?? "inconnu";

  return (
    // Téléphone : tiroir en bas (moitié de l'écran). Ordinateur (md:) : colonne à droite, toute la hauteur.
    <aside className="absolute inset-x-0 bottom-0 flex h-1/2 flex-col border-t border-bordure bg-surface md:inset-y-0 md:left-auto md:right-0 md:h-auto md:w-96 md:border-l md:border-t-0">
      {/* En-tête */}
      <div className="flex items-start justify-between border-b border-bordure p-5">
        <div>
          <p className="text-xs uppercase tracking-widest text-texte-discret">Pays sélectionné</p>
          <h2 className="mt-1 text-xl font-semibold">{pays.nom}</h2>
          <p className="mt-1 text-sm text-texte-doux">
            {donnees === null
              ? "Chargement…"
              : `${attaquesDuPays.length} attaque${attaquesDuPays.length > 1 ? "s" : ""} récente${attaquesDuPays.length > 1 ? "s" : ""}` +
                (secteur !== "tous" ? ` · ${secteur}` : "") +
                (donnees.sources?.ransomware === "exemple" ? " · données d'exemple" : "")}
          </p>
        </div>
        <button
          onClick={onClose}
          aria-label="Fermer le panneau"
          className="rounded-md px-2 py-1 text-texte-discret hover:bg-bordure hover:text-texte"
        >
          ✕
        </button>
      </div>

      {/* Onglets */}
      <div className="flex gap-1 border-b border-bordure px-3 py-2 text-sm">
        {onglets.map((o) => (
          <button
            key={o.cle}
            onClick={() => setOnglet(o.cle)}
            className={
              onglet === o.cle
                ? "rounded-md bg-bordure px-3 py-1.5 text-texte"
                : "rounded-md px-3 py-1.5 text-texte-doux hover:text-texte"
            }
          >
            {o.texte}
          </button>
        ))}
      </div>

      {/* Contenu : overflow-y-auto = la liste défile si elle est trop longue */}
      <div className="flex-1 space-y-2 overflow-y-auto p-3">
        {/* Squelette pendant le chargement : 3 blocs gris qui clignotent (animate-pulse) */}
        {onglet !== "apt" && donnees === null &&
          [1, 2, 3].map((n) => <div key={n} className="h-16 animate-pulse rounded-lg bg-bordure/50" />)}

        {onglet !== "apt" && donnees !== null &&
          (liste.length === 0 ? (
            <p className="p-2 text-sm text-texte-discret">Aucune attaque récente dans cette catégorie.</p>
          ) : (
            liste.map((a) => (
              // <details> = un élément d'accordéon : clic sur le résumé pour déplier le détail.
              <details key={a.id} className="rounded-lg border border-bordure bg-fond">
                <summary className="cursor-pointer list-none p-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate font-medium">{a.cible}</span>
                    <span className={`shrink-0 rounded px-2 py-0.5 text-xs ${badges[a.type] ?? "bg-red-950 text-red-300"}`}>
                      {a.type}
                    </span>
                  </div>
                  <p className="mt-1 font-mono text-xs text-texte-discret">
                    {a.date} · {a.secteur}
                  </p>
                </summary>
                <div className="space-y-1 border-t border-bordure p-3 text-sm text-texte-doux">
                  <p>{a.resume}</p>
                  <p>
                    Groupe : <span className="text-texte">{nomGroupe(a)}</span>
                  </p>
                  {a.source && (
                    <a href={a.source} target="_blank" rel="noreferrer" className="inline-block text-accent hover:underline">
                      Voir la source →
                    </a>
                  )}
                </div>
              </details>
            ))
          ))}

        {/* L'onglet APT a son propre composant (il charge ses données tout seul) */}
        {onglet === "apt" && <AptList pays={pays} />}
      </div>
    </aside>
  );
}
