"use client";

import { useEffect, useRef } from "react";
import { geoNaturalEarth1, geoPath } from "d3-geo";
import { select } from "d3-selection";
import { zoom, zoomIdentity } from "d3-zoom";
import { feature } from "topojson-client";
import monde from "world-atlas/countries-110m.json";

// Taille du dessin (en unités SVG) : la carte s'adapte ensuite à la largeur de l'écran.
const LARGEUR = 960;
const HAUTEUR = 500;

// 1. On transforme le fichier TopoJSON en une liste de pays (GeoJSON).
// L'Antarctique (id 010) est retirée : elle prend beaucoup de place pour rien.
// 3 territoires n'ont pas d'id dans le fichier (Somaliland, Kosovo, Chypre du Nord) :
// on leur donne leur nom comme id, sinon ils se croient tous "sélectionnés" (undefined === undefined).
const pays = feature(monde, monde.objects.countries)
  .features.filter((p) => p.id !== "010")
  .map((p) => ({ ...p, id: p.id ?? p.properties.name }));

// 2. La projection transforme les coordonnées GPS (longitude, latitude) en points sur l'écran.
const projection = geoNaturalEarth1().fitSize([LARGEUR, HAUTEUR], {
  type: "FeatureCollection",
  features: pays,
});

// 3. geoPath fabrique, pour chaque pays, le tracé SVG (l'attribut "d" d'un <path>).
const tracer = geoPath(projection);

// Une échelle de couleurs par type d'attaque : rouge pour le ransomware, bleu pour le phishing.
// Plus il y a d'attaques, plus la couleur est vive. Exportées pour que la légende utilise
// exactement les mêmes couleurs que la carte.
// (Les classes sont écrites en entier : Tailwind ne repère que les noms complets dans le code.)
export const echelles = {
  Ransomware: [
    { min: 10, texte: "10+", classe: "fill-red-700", fond: "bg-red-700" },
    { min: 5, texte: "5–9", classe: "fill-red-800", fond: "bg-red-800" },
    { min: 2, texte: "2–4", classe: "fill-red-900", fond: "bg-red-900" },
    { min: 1, texte: "1", classe: "fill-red-950", fond: "bg-red-950" },
  ],
  Phishing: [
    { min: 10, texte: "10+", classe: "fill-sky-600", fond: "bg-sky-600" },
    { min: 5, texte: "5–9", classe: "fill-sky-700", fond: "bg-sky-700" },
    { min: 2, texte: "2–4", classe: "fill-sky-800", fond: "bg-sky-800" },
    { min: 1, texte: "1", classe: "fill-sky-900", fond: "bg-sky-900" },
  ],
};

// Couleur d'un pays : on prend son type d'attaque principal (le plus nombreux),
// puis le palier qui correspond au TOTAL des attaques du pays.
// parType = { Ransomware: 60, Phishing: 3 }
function couleurPays(parType = {}) {
  const types = Object.entries(parType).filter(([type, n]) => n > 0 && echelles[type]);
  if (types.length === 0) return "fill-zinc-800";
  const [typePrincipal] = types.sort((a, b) => b[1] - a[1])[0];
  const total = types.reduce((somme, [, n]) => somme + n, 0);
  return echelles[typePrincipal].find((p) => total >= p.min).classe;
}

// Texte de l'infobulle : "France — 60 ransomware, 3 phishing" ou "France — aucune attaque récente".
function infobulle(nom, parType = {}) {
  const details = Object.entries(parType)
    .filter(([, n]) => n > 0)
    .map(([type, n]) => `${n} ${type.toLowerCase()}`);
  return `${nom} — ${details.length ? details.join(", ") : "aucune attaque récente"}`;
}

const styleBouton =
  "flex size-8 items-center justify-center rounded-md border border-bordure bg-surface/90 text-texte-doux hover:bg-bordure hover:text-texte";

// Props reçues du parent :
// - selection : l'id du pays sélectionné (ou null)
// - onSelect  : la fonction à appeler quand on clique sur un pays
// - nombres   : { "250": { Ransomware: 60, Phishing: 3 }, ... } attaques par pays et par type
// - interactif : false = simple aperçu (sur la landing) : survol rouge, mais pas de clic, de clavier ni de zoom
export default function WorldMap({ selection, onSelect, nombres = {}, interactif = true }) {
  // useRef = une "poignée" vers un élément HTML/SVG réel, pour que d3 puisse agir dessus.
  const svgRef = useRef(null);
  const groupeRef = useRef(null);
  const zoomRef = useRef(null);

  // Mise en place du zoom, une fois la carte affichée.
  useEffect(() => {
    if (!interactif) return;
    const svg = select(svgRef.current);

    const comportement = zoom()
      .scaleExtent([1, 8]) // de 1× (monde entier) à 8× maximum
      .translateExtent([[0, 0], [LARGEUR, HAUTEUR]]) // on ne peut pas faire sortir la carte du cadre
      .on("zoom", (evenement) => {
        // À chaque mouvement, d3 nous donne la transformation (déplacement + échelle)
        // et on l'applique au groupe <g> qui contient tous les pays.
        select(groupeRef.current).attr("transform", evenement.transform);
      });

    // d3-zoom écoute la molette, le glisser et le pincement, et appelle preventDefault() :
    // c'est la carte qui zoome, pas la page web.
    svg.call(comportement);
    zoomRef.current = comportement;

    // Nettoyage quand le composant disparaît : on retire les écouteurs du zoom.
    return () => svg.on(".zoom", null);
  }, [interactif]);

  const zoomer = (facteur) => zoomRef.current?.scaleBy(select(svgRef.current), facteur);
  const reinitialiser = () => zoomRef.current?.transform(select(svgRef.current), zoomIdentity);

  return (
    <div className="relative h-full w-full">
      {/* h-full w-full : la carte prend toute la place de son parent.
          preserveAspectRatio : elle garde ses proportions et se centre (pas de pays déformés). */}
      <svg
        ref={svgRef}
        viewBox={`0 0 ${LARGEUR} ${HAUTEUR}`}
        preserveAspectRatio="xMidYMid meet"
        // touch-none : sur téléphone, le pincement zoome la carte au lieu de zoomer la page.
        className={"h-full w-full" + (interactif ? " touch-none cursor-grab active:cursor-grabbing" : "")}
        role="img"
        aria-label="Carte du monde"
      >
        <g ref={groupeRef}>
          {pays.map((p) => {
            const estSelectionne = p.id === selection;
            const parType = nombres[p.id];
            return (
              <path
                key={p.id}
                d={tracer(p)}
                // Les frontières gardent la même épaisseur même quand on zoome.
                vectorEffect="non-scaling-stroke"
                // tabIndex + onKeyDown : on peut aussi choisir un pays au clavier (Tab puis Entrée).
                // "?." : on n'appelle onSelect que s'il a été fourni.
                tabIndex={interactif ? 0 : undefined}
                onClick={interactif ? () => onSelect?.(p.id, p.properties.name) : undefined}
                onKeyDown={interactif ? (e) => e.key === "Enter" && onSelect?.(p.id, p.properties.name) : undefined}
                className={
                  (interactif ? "cursor-pointer " : "") +
                  // Pays sélectionné : rouge vif avec contour blanc. Sinon : couleur selon le palier.
                  (estSelectionne
                    ? "fill-red-500 stroke-white stroke-1 outline-none"
                    : couleurPays(parType) +
                      " stroke-zinc-700 stroke-[0.5] outline-none transition-colors duration-150 hover:fill-red-600 focus:fill-red-600")
                }
              >
                {/* Le <title> affiche le nom du pays en infobulle au survol. */}
                <title>{infobulle(p.properties.name, parType)}</title>
              </path>
            );
          })}
        </g>
      </svg>

      {/* Boutons de zoom, en haut à gauche de la carte */}
      {interactif && (
        <div className="absolute left-4 top-4 flex flex-col gap-1">
          <button onClick={() => zoomer(1.5)} aria-label="Zoomer" className={styleBouton}>+</button>
          <button onClick={() => zoomer(1 / 1.5)} aria-label="Dézoomer" className={styleBouton}>−</button>
          <button onClick={reinitialiser} aria-label="Revenir au monde entier" className={styleBouton}>⟲</button>
        </div>
      )}
    </div>
  );
}
