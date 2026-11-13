import { groupesDuPays } from "@/lib/apt";

// GET /api/apt?pays=643 → { source, bases: [...], cibles: [...] }
// bases = groupes originaires du pays, cibles = groupes qui ont attaqué le pays.
export async function GET(request) {
  const pays = request.nextUrl.searchParams.get("pays");
  if (!pays) return Response.json({ erreur: "Paramètre ?pays= manquant" }, { status: 400 });

  try {
    const { bases, cibles } = await groupesDuPays(pays);
    return Response.json({ source: "misp-galaxy", bases, cibles });
  } catch (erreur) {
    console.error("MISP Galaxy indisponible :", erreur.message);
    return Response.json({ source: "erreur", bases: [], cibles: [] });
  }
}
