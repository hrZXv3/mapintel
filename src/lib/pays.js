import pays from "i18n-iso-countries";
import fr from "i18n-iso-countries/langs/fr.json";
import en from "i18n-iso-countries/langs/en.json";

// On charge les noms de pays en français (affichage) et en anglais (OTX donne des noms anglais).
pays.registerLocale(fr);
pays.registerLocale(en);

// Noms officiels ISO que la bibliothèque ne reconnaît pas toute seule.
const alias = {
  "United Kingdom of Great Britain and Northern Ireland": "GB",
  "Viet Nam": "VN",
  Syria: "SY",
  Laos: "LA",
};

// "France" ou "United States of America" (OTX) → "250" / "840" (code de la carte).
// Si le nom complet échoue, on essaie la partie avant la virgule : "Iran, Islamic Republic of" → "Iran".
export const nomAnglaisVersNumerique = (nom) => {
  const alpha2 = alias[nom] ?? pays.getAlpha2Code(nom, "en") ?? pays.getAlpha2Code(nom.split(",")[0], "en");
  return alpha2 ? pays.alpha2ToNumeric(alpha2) : undefined;
};

// Convertit les codes pays : "FR" (ransomware.live) ⇄ "250" (fichier de la carte).
export const versNumerique = (alpha2) => pays.alpha2ToNumeric(alpha2);
export const versAlpha2 = (numerique) => pays.numericToAlpha2(numerique);

// Nom français à partir du code de la carte. { select: "alias" } donne le nom court quand il existe.
export const nomPays = (numerique) => {
  const alpha2 = versAlpha2(numerique);
  return alpha2 ? pays.getName(alpha2, "fr", { select: "alias" }) : undefined;
};
