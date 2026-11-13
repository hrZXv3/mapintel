"use client";

import { Fragment, useEffect, useState } from "react";
import WorldMap, { echelles } from "@/components/WorldMap";
import SidePanel from "@/components/SidePanel";
import { nomPays } from "@/lib/pays";
import { JOURS } from "@/lib/periode";

// Les types d'attaque affichables, avec leur couleur de pastille.
export const typesAttaque = [
  { cle: "Ransomware", couleur: "bg-red-500" },
  { cle: "Phishing", couleur: "bg-sky-500" },
];

// Texte affiché à côté de chaque type selon l'état de sa source.
const etatSource = {
  "ransomware.live": "ransomware.live",
  otx: "AlienVault OTX",
  exemple: "données d'exemple",
  "cle-manquante": "clé OTX manquante",
  erreur: "source indisponible",
};

// Ce composant relie la carte et le panneau : il retient quel pays est sélectionné,
// quels types d'attaque sont affichés, et charge les attaques récentes.
export default function CarteInteractive() {
  // null = aucun pays sélectionné, donc panneau fermé.
  const [pays, setPays] = useState(null);
  // Toutes les attaques récentes (ransomware + phishing), et l'état de chaque source.
  const [attaques, setAttaques] = useState([]);
  const [sources, setSources] = useState(null);
  // Types cochés : on peut masquer le ransomware ou le phishing en cliquant sur leur pastille.
  const [typesActifs, setTypesActifs] = useState(["Ransomware", "Phishing"]);
  // Secteur choisi dans le menu déroulant ("tous" = pas de filtre).
  const [secteur, setSecteur] = useState("tous");

  // useEffect lance du code APRÈS l'affichage. Le [] à la fin = une seule fois, à l'ouverture de la page.
  useEffect(() => {
    fetch("/api/attaques")
      .then((reponse) => reponse.json())
      .then((donnees) => {
        setAttaques(donnees.attaques);
        setSources(donnees.sources);
      });
  }, []);

  // Ajoute le type s'il n'y est pas, l'enlève s'il y est.
  function basculerType(type) {
    setTypesActifs((actuels) =>
      actuels.includes(type) ? actuels.filter((t) => t !== type) : [...actuels, type],
    );
  }

  // Les attaques des types cochés (avant le filtre secteur, pour remplir le menu).
  const attaquesDesTypes = attaques.filter((a) => typesActifs.includes(a.type));

  // Liste du menu Secteur : chaque secteur avec son nombre d'attaques, du plus touché au moins touché.
  // { "Santé": 35, "Transport": 42, ... } → [["Transport", 42], ["Santé", 35], ...]
  const compteSecteurs = {};
  for (const a of attaquesDesTypes) compteSecteurs[a.secteur] = (compteSecteurs[a.secteur] ?? 0) + 1;
  const listeSecteurs = Object.entries(compteSecteurs).sort((a, b) => b[1] - a[1]);
  // Si on décoche un type, le secteur choisi peut ne plus avoir d'attaque : on le garde dans le menu (0).
  if (secteur !== "tous" && !compteSecteurs[secteur]) listeSecteurs.push([secteur, 0]);

  // Attaques par pays ET par type, en ne comptant que les types cochés et le secteur choisi :
  // { "250": { Ransomware: 60, Phishing: 3 }, "804": { Phishing: 3 }, ... }
  const nombres = {};
  for (const a of attaquesDesTypes) {
    if (secteur !== "tous" && a.secteur !== secteur) continue;
    nombres[a.pays] ??= {}; // "??=" : crée l'objet seulement s'il n'existe pas encore
    nombres[a.pays][a.type] = (nombres[a.pays][a.type] ?? 0) + 1;
  }

  function choisirPays(id, nomAnglais) {
    // On prend le nom français s'il existe, sinon le nom anglais de la carte.
    setPays({ id, nom: nomPays(id) ?? nomAnglais });
  }

  return (
    // flex-col : la barre de légende en haut, la carte prend le reste (flex-1).
    <div className="relative flex h-full w-full flex-col">
      {/* Barre de légende, AU-DESSUS de la carte (elle ne cache aucun pays) */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-b border-bordure bg-fond px-4 py-2.5 text-xs text-texte-doux">
        {/* Types d'attaque : cliquer sur une pastille l'affiche ou la masque */}
        <div className="flex items-center gap-2">
          <span className="text-texte-discret">Type</span>
          {typesAttaque.map((t) => {
            const actif = typesActifs.includes(t.cle);
            const nombre = attaques.filter((a) => a.type === t.cle).length;
            const source = sources?.[t.cle.toLowerCase()];
            return (
              <button
                key={t.cle}
                onClick={() => basculerType(t.cle)}
                aria-pressed={actif}
                title={source ? `Source : ${etatSource[source]}` : "Chargement…"}
                className={
                  actif
                    ? "flex items-center gap-1.5 rounded-full border border-bordure-forte bg-surface px-2.5 py-1 text-texte"
                    : "flex items-center gap-1.5 rounded-full border border-dashed border-bordure px-2.5 py-1 text-texte-discret line-through"
                }
              >
                <span className={`size-2 rounded-full ${t.couleur}`} />
                {t.cle}
                <span className="text-texte-discret">
                  {source === "cle-manquante" || source === "erreur" ? `· ${etatSource[source]}` : `· ${nombre}`}
                </span>
              </button>
            );
          })}
        </div>

        {/* Menu déroulant Secteur. <select> est la liste déroulante native du navigateur :
            elle marche au clavier et sur téléphone sans rien coder de plus. */}
        <label className="flex items-center gap-2">
          <span className="text-texte-discret">Secteur</span>
          <select
            value={secteur}
            onChange={(e) => setSecteur(e.target.value)}
            className="rounded-md border border-bordure-forte bg-surface px-2 py-1 text-texte outline-none focus:border-accent"
          >
            <option value="tous">Tous les secteurs ({attaquesDesTypes.length})</option>
            {listeSecteurs.map(([nom, n]) => (
              <option key={nom} value={nom}>
                {nom} ({n})
              </option>
            ))}
          </select>
        </label>

        {/* Échelles de couleurs : une ligne par type coché, du gris (0) à la couleur vive (10+).
            La grille aligne les cases : 1 colonne pour le nom, puis 5 colonnes de 1,75rem. */}
        <div className="flex items-center gap-3">
          <span className="text-texte-discret">Attaques par pays · {JOURS} derniers jours</span>
          <div className="grid grid-cols-[auto_repeat(5,1.75rem)] items-center gap-x-1 gap-y-1">
            <span />
            {["0", ...[...echelles.Ransomware].reverse().map((p) => p.texte)].map((texte) => (
              <span key={texte} className="text-center text-[10px] text-texte-discret">{texte}</span>
            ))}
            {typesAttaque
              .filter((t) => typesActifs.includes(t.cle))
              .map((t) => (
                // <Fragment key> : un groupe invisible de cases, une ligne de la grille par type
                <Fragment key={t.cle}>
                  <span className="pr-1">{t.cle}</span>
                  <span className="h-2.5 rounded-sm bg-zinc-800" />
                  {[...echelles[t.cle]].reverse().map((p) => (
                    <span key={p.texte} className={`h-2.5 rounded-sm ${p.fond}`} />
                  ))}
                </Fragment>
              ))}
          </div>
        </div>

        {/* Sources, poussées à droite (ml-auto) */}
        <p className="text-texte-discret md:ml-auto">
          {sources === null
            ? "Chargement des données…"
            : `Sources : ${etatSource[sources.ransomware]} · ${etatSource[sources.phishing]}`}
        </p>
      </div>

      <div className="min-h-0 flex-1">
        <WorldMap selection={pays?.id} onSelect={choisirPays} nombres={nombres} />
      </div>

      {/* Le panneau n'est affiché que si un pays est sélectionné. */}
      {pays && (
        <SidePanel
          key={pays.id}
          pays={pays}
          typesActifs={typesActifs}
          secteur={secteur}
          onClose={() => setPays(null)}
        />
      )}
    </div>
  );
}
