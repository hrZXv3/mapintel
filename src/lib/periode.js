// La période affichée sur la carte, la même pour toutes les sources.
export const JOURS = 7;

// La date limite : maintenant moins 7 jours (en millisecondes : jours × 24 h × 60 min × 60 s × 1000).
export const dateLimite = () => new Date(Date.now() - JOURS * 24 * 60 * 60 * 1000);

// Une date (texte ISO, ex. "2026-10-16T09:34:09Z") est-elle dans la période ?
export const estRecente = (texteDate) => Boolean(texteDate) && new Date(texteDate) >= dateLimite();
