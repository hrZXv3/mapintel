// Les deux sources nomment les secteurs en anglais, et pas de la même façon
// (ransomware.live dit "Financial Services", OTX dit "Finance").
// On ramène tout vers un même nom français, pour pouvoir filtrer par secteur.
const traductions = {
  // ransomware.live
  "Professional Services": "Services aux entreprises",
  Manufacturing: "Industrie",
  Technology: "Technologie",
  "Government & Defense": "Gouvernement et défense",
  Healthcare: "Santé",
  "Retail & E-Commerce": "Commerce",
  "Agriculture and Food Production": "Agroalimentaire",
  Transportation: "Transport",
  Hospitality: "Hôtellerie",
  Education: "Éducation",
  "Financial Services": "Finance",
  "Energy & Utilities": "Énergie",
  Construction: "Construction",
  Other: "Autre",
  // AlienVault OTX
  Finance: "Finance",
  Government: "Gouvernement et défense",
  Defense: "Gouvernement et défense",
  Media: "Médias",
  Telecommunications: "Télécoms",
  Energy: "Énergie",
  Retail: "Commerce",
  NGO: "ONG",
  "Real Estate": "Immobilier",
};

export const SECTEUR_INCONNU = "Non précisé";

export function traduireSecteur(texte) {
  if (!texte || texte === "Not Found") return SECTEUR_INCONNU;
  return traductions[texte] ?? texte;
}
