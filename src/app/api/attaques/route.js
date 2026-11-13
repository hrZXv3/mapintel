import { victimesRecentes, victimesDuPays } from "@/lib/ransomware";
import { phishingRecent } from "@/lib/phishing";
import { attaques as exemples } from "@/data/attaques";

// Route serveur : GET /api/attaques            → attaques récentes dans le monde
//                 GET /api/attaques?pays=250   → attaques d'un pays (ici la France)
// Elle tourne sur le serveur Next : le navigateur ne parle jamais directement aux sources
// (et ne voit donc jamais la clé OTX).
export async function GET(request) {
  const pays = request.nextUrl.searchParams.get("pays");

  // Promise.all lance les deux sources EN MÊME TEMPS et attend les deux réponses.
  const [ransomware, phishing] = await Promise.all([chargerRansomware(pays), phishingRecent()]);
  const phishingFiltre = pays ? phishing.attaques.filter((a) => a.pays === pays) : phishing.attaques;

  return Response.json({
    sources: { ransomware: ransomware.source, phishing: phishing.source },
    attaques: [...ransomware.attaques, ...phishingFiltre],
  });
}

// Ransomware : historique du pays, sinon victimes récentes, sinon données d'exemple.
async function chargerRansomware(pays) {
  if (pays) {
    try {
      return { source: "ransomware.live", attaques: await victimesDuPays(pays) };
    } catch (erreur) {
      // Ex. 429 = trop de requêtes : on passe au plan B ci-dessous.
      console.error(`ransomware.live (pays ${pays}) :`, erreur.message);
    }
  }

  try {
    // Plan B : les victimes récentes (souvent déjà en cache, donc ça marche).
    const recentes = await victimesRecentes();
    return { source: "ransomware.live", attaques: pays ? recentes.filter((a) => a.pays === pays) : recentes };
  } catch (erreur) {
    // Plan C : l'API ne répond pas du tout → données d'exemple, en le signalant.
    console.error("ransomware.live indisponible :", erreur.message);
    const ransomwareExemples = exemples.filter((a) => a.type === "Ransomware");
    return { source: "exemple", attaques: pays ? ransomwareExemples.filter((a) => a.pays === pays) : ransomwareExemples };
  }
}
