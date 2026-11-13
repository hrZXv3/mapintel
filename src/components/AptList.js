"use client";

import { useEffect, useState } from "react";
import { nomPays } from "@/lib/pays";

// L'onglet "Groupes APT" du panneau, avec deux listes :
// - "bases"  : les groupes ORIGINAIRES du pays (ex. Corée du Nord → Lazarus Group)
// - "cibles" : les groupes qui ont CIBLÉ le pays (ex. France → APT28)
// Données : MISP Galaxy, via notre route /api/apt.
export default function AptList({ pays }) {
  const [donnees, setDonnees] = useState(null);
  const [vue, setVue] = useState(null); // "bases" ou "cibles", choisie quand les données arrivent

  useEffect(() => {
    fetch(`/api/apt?pays=${pays.id}`)
      .then((reponse) => reponse.json())
      .then((d) => {
        setDonnees(d);
        // Par défaut : les groupes du pays s'il y en a, sinon ceux qui l'ont ciblé.
        setVue(d.bases.length > 0 ? "bases" : "cibles");
      })
      .catch(() => setDonnees({ source: "erreur", bases: [], cibles: [] }));
  }, [pays.id]);

  if (donnees === null) {
    return [1, 2, 3].map((n) => <div key={n} className="h-16 animate-pulse rounded-lg bg-bordure/50" />);
  }

  const vues = [
    { cle: "bases", texte: `Originaires (${donnees.bases.length})` },
    { cle: "cibles", texte: `L'ont ciblé (${donnees.cibles.length})` },
  ];
  const groupes = donnees[vue] ?? [];

  return (
    <>
      {/* Sélecteur entre les deux listes */}
      <div className="grid grid-cols-2 gap-1 rounded-lg border border-bordure bg-fond p-1 text-xs">
        {vues.map((v) => (
          <button
            key={v.cle}
            onClick={() => setVue(v.cle)}
            className={vue === v.cle ? "rounded-md bg-bordure py-1.5 text-texte" : "rounded-md py-1.5 text-texte-doux hover:text-texte"}
          >
            {v.texte}
          </button>
        ))}
      </div>

      <p className="px-1 text-xs text-texte-discret">
        {vue === "bases"
          ? `Groupes dont l'origine présumée est : ${pays.nom}.`
          : `Groupes soupçonnés d'avoir attaqué : ${pays.nom}.`}
      </p>

      {donnees.source === "erreur" && (
        <p className="p-2 text-sm text-texte-discret">Source MISP Galaxy indisponible pour le moment.</p>
      )}
      {donnees.source !== "erreur" && groupes.length === 0 && (
        <p className="p-2 text-sm text-texte-discret">Aucun groupe référencé dans cette catégorie.</p>
      )}

      {groupes.map((g) => (
        <details key={g.id} className="rounded-lg border border-bordure bg-fond">
          <summary className="cursor-pointer list-none p-3">
            <div className="flex items-center justify-between gap-2">
              <span className="font-medium">{g.nom}</span>
              {g.mitre && <span className="font-mono text-xs text-accent">{g.mitre}</span>}
            </div>
            <p className="mt-1 text-xs text-texte-discret">
              Origine présumée : {g.origine ? nomPays(g.origine) : "inconnue"}
            </p>
          </summary>
          <div className="space-y-1 border-t border-bordure p-3 text-sm text-texte-doux">
            {g.alias && <p>Alias : {g.alias}</p>}
            {g.cibles && <p>Cibles : {g.cibles}</p>}
            {g.victimes.length > 0 && (
              <p>Pays visés : {g.victimes.slice(0, 8).map(nomPays).join(", ")}</p>
            )}
            {g.description && <p className="text-xs">{g.description}…</p>}
            <a
              href={g.mitre ? `https://attack.mitre.org/groups/${g.mitre}/` : "https://github.com/MISP/misp-galaxy"}
              target="_blank"
              rel="noreferrer"
              className="inline-block text-accent hover:underline"
            >
              {g.mitre ? "Fiche MITRE ATT&CK →" : "Source MISP Galaxy →"}
            </a>
          </div>
        </details>
      ))}
    </>
  );
}
