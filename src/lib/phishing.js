import { nomAnglaisVersNumerique } from "@/lib/pays";
import { estRecente } from "@/lib/periode";
import { traduireSecteur } from "@/lib/secteurs";

const API = "https://otx.alienvault.com/api/v1";

// Nombre de pages de 50 rapports à lire (≈ 1 semaine par page). On en lit 2 par sécurité,
// puis on ne garde que les rapports publiés pendant les 7 derniers jours (comme le ransomware).
const PAGES = 2;

// Un rapport parle-t-il de phishing ? On cherche "phish" dans son titre, ses tags et sa description.
const parleDePhishing = (pulse) =>
  `${pulse.name} ${(pulse.tags ?? []).join(" ")} ${pulse.description ?? ""}`.toLowerCase().includes("phish");

// Les "pulses" OTX sont des rapports de menace.
// On lit le flux "subscribed" : les rapports rédigés par les analystes d'AlienVault, qui indiquent
// les pays et secteurs ciblés. (La recherche "phishing" ne renvoie que des flux automatiques sans pays.)
// Retourne { source, attaques } — source : "otx", "cle-manquante" ou "erreur".
export async function phishingRecent() {
  // process.env lit les variables de .env.local. Ce code tourne sur le serveur :
  // la clé n'est jamais envoyée au navigateur.
  const cle = process.env.OTX_API_KEY;
  if (!cle) return { source: "cle-manquante", attaques: [] };

  try {
    // On demande les pages en même temps (Promise.all), puis on les met bout à bout (flat).
    const pages = await Promise.all(
      Array.from({ length: PAGES }, (_, i) => chargerPage(cle, i + 1)),
    );
    // "created" = date de publication du rapport (alors que "modified" bouge à chaque mise à jour).
    const results = pages.flat().filter((p) => parleDePhishing(p) && estRecente(p.created));

    // Un pulse peut viser plusieurs pays : on crée une "attaque" par pays visé.
    // flatMap = map + mise à plat : [[a, b], [c]] → [a, b, c].
    const attaques = results.flatMap((pulse) =>
      (pulse.targeted_countries ?? [])
        .map((nomPays) => nomAnglaisVersNumerique(nomPays))
        .filter(Boolean)
        .map((pays) => normaliser(pulse, pays)),
    );
    return { source: "otx", attaques };
  } catch (erreur) {
    console.error("OTX indisponible :", erreur.message);
    return { source: "erreur", attaques: [] };
  }
}

// Une page de 50 rapports, gardée en cache 1 heure comme pour ransomware.live.
async function chargerPage(cle, page) {
  const reponse = await fetch(`${API}/pulses/subscribed?limit=50&page=${page}`, {
    headers: { "X-OTX-API-KEY": cle },
    next: { revalidate: 3600 },
  });
  if (!reponse.ok) throw new Error(`OTX a répondu ${reponse.status}`);
  const { results = [] } = await reponse.json();
  return results;
}

// Transforme un pulse OTX en une "attaque" au même format que les ransomwares.
function normaliser(pulse, pays) {
  const secteurs = pulse.industries ?? [];
  return {
    id: `otx-${pulse.id}-${pays}`,
    date: (pulse.created ?? pulse.modified ?? "").slice(0, 10),
    pays,
    typeCible: secteurs.some((s) => /gov/i.test(s)) ? "gouvernement" : "entreprise",
    cible: pulse.name,
    secteur: traduireSecteur(secteurs[0]),
    type: "Phishing",
    groupe: pulse.adversary || "inconnu",
    resume: (pulse.description || "Pas de description fournie.").slice(0, 400),
    source: `https://otx.alienvault.com/pulse/${pulse.id}`,
  };
}
