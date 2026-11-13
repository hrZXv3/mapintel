import { versNumerique, versAlpha2 } from "@/lib/pays";
import { dateLimite, estRecente } from "@/lib/periode";
import { traduireSecteur } from "@/lib/secteurs";

const API = "https://api.ransomware.live/v2";

// Transforme une victime ransomware.live en une "attaque" au format de notre panneau.
// Les deux adresses de l'API n'utilisent pas les mêmes noms de champs (victim/post_title, group/group_name),
// d'où les "??" : on prend le premier qui existe.
function normaliser(v, index) {
  const secteur = traduireSecteur(v.activity);
  return {
    id: `${v.discovered}-${index}`,
    date: (v.discovered ?? "").slice(0, 10), // "2026-10-16T09:34:09..." → "2026-10-16"
    pays: versNumerique(v.country) ?? null,
    typeCible: secteur === "Gouvernement et défense" ? "gouvernement" : "entreprise",
    cible: v.victim ?? v.post_title ?? "Victime non nommée",
    secteur,
    type: "Ransomware",
    groupe: v.group ?? v.group_name ?? "inconnu",
    resume: v.description || "Pas de description fournie.",
    // On ne garde JAMAIS les liens .onion (sites des criminels) : seulement la page ransomware.live.
    source: v.url ?? "https://www.ransomware.live",
  };
}

// Récupère une adresse de l'API. revalidate: 3600 = Next garde la réponse en cache 1 heure,
// puis la redemande. La carte est donc à jour à l'heure près, sans surcharger l'API.
async function charger(chemin) {
  const reponse = await fetch(`${API}${chemin}`, { next: { revalidate: 3600 } });
  if (!reponse.ok) throw new Error(`ransomware.live a répondu ${reponse.status}`);
  return reponse.json();
}

// "/victims/2026/10" : les victimes d'un mois donné (getMonth() compte de 0 à 11, d'où le + 1).
const cheminMois = (date) => `/victims/${date.getUTCFullYear()}/${date.getUTCMonth() + 1}`;

// Les victimes des 7 derniers jours dans le monde (pour colorer la carte).
// On charge le mois en cours, et aussi le mois d'avant si les 7 jours commencent le mois précédent
// (ex. le 3 novembre, il faut aussi fin octobre). Un Set évite de charger deux fois le même mois.
export async function victimesRecentes() {
  const chemins = [...new Set([cheminMois(dateLimite()), cheminMois(new Date())])];
  const mois = await Promise.all(chemins.map(charger));
  return mois
    .flat()
    .filter((v) => estRecente(v.discovered))
    .map(normaliser)
    .filter((a) => a.pays);
}

// Petit cache en mémoire pour l'historique des pays : { "FR": { quand, attaques } }.
// Pourquoi ? L'historique brut d'un grand pays est énorme (9 Mo pour les États-Unis) et le cache
// de Next refuse tout ce qui dépasse 2 Mo. On garde donc seulement le résultat final, qui est petit.
const cachePays = new Map();
const UNE_HEURE = 60 * 60 * 1000;

// Les victimes les plus récentes d'un pays (quand on clique dessus) :
// 30 entreprises + 30 cibles gouvernementales, pour que les deux onglets aient du contenu.
export async function victimesDuPays(numerique) {
  const alpha2 = versAlpha2(numerique);
  if (!alpha2) return [];

  const enCache = cachePays.get(alpha2);
  if (enCache && Date.now() - enCache.quand < UNE_HEURE) return enCache.attaques;

  // cache: "no-store" : on ne demande pas à Next de stocker la réponse brute (trop grosse).
  const reponse = await fetch(`${API}/countryvictims/${alpha2}`, { cache: "no-store" });
  if (!reponse.ok) throw new Error(`ransomware.live a répondu ${reponse.status}`);
  const donnees = await reponse.json();

  const triees = donnees.map(normaliser).sort((a, b) => b.date.localeCompare(a.date));
  const attaques = [
    ...triees.filter((a) => a.typeCible === "entreprise").slice(0, 30),
    ...triees.filter((a) => a.typeCible === "gouvernement").slice(0, 30),
  ];
  cachePays.set(alpha2, { quand: Date.now(), attaques });
  return attaques;
}
