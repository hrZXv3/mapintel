import { versNumerique, nomAnglaisVersNumerique } from "@/lib/pays";

// MISP Galaxy : base publique de référence sur les groupes de menace (APT), maintenue par la
// communauté MISP sur GitHub. Pour chaque groupe : pays d'origine présumé, pays victimes, alias…
const URL_MISP = "https://raw.githubusercontent.com/MISP/misp-galaxy/main/clusters/threat-actor.json";

// Transforme un groupe MISP en un format simple pour notre panneau.
function normaliser(groupe) {
  const meta = groupe.meta ?? {};
  // L'identifiant MITRE (ex. G0007) se cache parfois dans les liens de référence.
  const lienMitre = (meta.refs ?? []).find((r) => /attack\.mitre\.org\/groups\/G\d+/.test(r));
  return {
    id: groupe.uuid,
    nom: groupe.value,
    alias: (meta.synonyms ?? []).slice(0, 4).join(", "),
    origine: meta.country ? versNumerique(meta.country) : null, // "RU" → "643"
    // Les victimes sont des noms anglais ("France", "United States"), parfois des organisations
    // ("HSBC") ou des régions ("Middle East") : on ne garde que ce qui est un vrai pays.
    victimes: (meta["cfr-suspected-victims"] ?? []).map(nomAnglaisVersNumerique).filter(Boolean),
    cibles: (meta["cfr-target-category"] ?? []).join(", "),
    mitre: lienMitre?.match(/G\d+/)[0] ?? null,
    description: (groupe.description ?? "").slice(0, 300),
  };
}

// Tous les groupes, chargés depuis GitHub et gardés en cache 24 h
// (la base bouge peu, inutile de la retélécharger toutes les heures).
async function tousLesGroupes() {
  const reponse = await fetch(URL_MISP, { next: { revalidate: 86400 } });
  if (!reponse.ok) throw new Error(`MISP Galaxy a répondu ${reponse.status}`);
  const { values = [] } = await reponse.json();
  return values.map(normaliser);
}

// Les groupes liés à un pays (code de la carte, ex. "643" pour la Russie) :
// - bases   : les groupes qui VIENNENT de ce pays (ex. Russie → APT28, APT29…)
// - cibles  : les groupes qui ont ATTAQUÉ ce pays (ex. France → APT28, Lazarus…)
export async function groupesDuPays(numerique) {
  const groupes = await tousLesGroupes();
  // Les groupes avec un identifiant MITRE en premier : ce sont les mieux documentés.
  const mieuxDocumentesDabord = (a, b) => Number(Boolean(b.mitre)) - Number(Boolean(a.mitre));
  return {
    bases: groupes.filter((g) => g.origine === numerique).sort(mieuxDocumentesDabord),
    cibles: groupes.filter((g) => g.victimes.includes(numerique)).sort(mieuxDocumentesDabord),
  };
}
