// DONNÉES D'EXEMPLE : les incidents ci-dessous sont FICTIFS (cibles inventées), pour la démo.
// Les groupes APT, eux, sont réels et viennent de MITRE ATT&CK (https://attack.mitre.org/groups/).
//
// "pays" = l'identifiant du pays dans le fichier de la carte (world-atlas) : code ISO numérique.
// Exemples : 250 France, 840 États-Unis, 276 Allemagne, 804 Ukraine, 826 Royaume-Uni.

// Noms français des pays présents dans les données (la carte ne fournit que l'anglais).
export const nomsPays = {
  "250": "France",
  "840": "États-Unis",
  "276": "Allemagne",
  "804": "Ukraine",
  "826": "Royaume-Uni",
  "392": "Japon",
  "076": "Brésil",
  "410": "Corée du Sud",
};

export const attaques = [
  { id: 1, date: "2026-10-12", pays: "250", typeCible: "entreprise", cible: "Velora Énergie", secteur: "Énergie", type: "Ransomware", apt: null, confiance: "—", resume: "Chiffrement des serveurs de facturation, demande de rançon de 2 M€." },
  { id: 2, date: "2026-09-28", pays: "250", typeCible: "gouvernement", cible: "Ministère fictif des Transports", secteur: "Administration", type: "Espionnage", apt: "G0007", confiance: "Moyenne", resume: "Campagne d'hameçonnage ciblée contre des boîtes mail d'agents." },
  { id: 3, date: "2026-08-03", pays: "250", typeCible: "entreprise", cible: "Clinique Saint-Exemple", secteur: "Santé", type: "Fuite de données", apt: null, confiance: "—", resume: "Dossiers patients publiés sur un forum après intrusion." },
  { id: 4, date: "2026-10-01", pays: "840", typeCible: "gouvernement", cible: "Agence fédérale fictive", secteur: "Administration", type: "Espionnage", apt: "G0016", confiance: "Élevée", resume: "Compromission d'un fournisseur logiciel pour accéder au réseau." },
  { id: 5, date: "2026-07-19", pays: "840", typeCible: "entreprise", cible: "Northwind Bank", secteur: "Finance", type: "Vol de cryptomonnaie", apt: "G0032", confiance: "Moyenne", resume: "Faux recruteurs et pièce jointe piégée envoyée à des développeurs." },
  { id: 6, date: "2026-09-10", pays: "276", typeCible: "entreprise", cible: "Kessler Automobile", secteur: "Industrie", type: "Espionnage", apt: "G0096", confiance: "Faible", resume: "Exfiltration de plans techniques via une faille VPN non corrigée." },
  { id: 7, date: "2026-06-22", pays: "276", typeCible: "gouvernement", cible: "Parlement régional fictif", secteur: "Administration", type: "DDoS", apt: null, confiance: "—", resume: "Site indisponible pendant 6 h lors d'une séance publique." },
  { id: 8, date: "2026-10-08", pays: "804", typeCible: "gouvernement", cible: "Opérateur électrique fictif", secteur: "Énergie", type: "Wiper", apt: "G0034", confiance: "Élevée", resume: "Effacement de postes de supervision industrielle." },
  { id: 9, date: "2026-08-30", pays: "804", typeCible: "entreprise", cible: "TelcoNet UA", secteur: "Télécoms", type: "Wiper", apt: "G0034", confiance: "Moyenne", resume: "Coupure du réseau mobile après destruction de serveurs." },
  { id: 10, date: "2026-09-15", pays: "826", typeCible: "gouvernement", cible: "Conseil municipal fictif", secteur: "Administration", type: "Ransomware", apt: null, confiance: "—", resume: "Services en ligne de la ville coupés pendant une semaine." },
  { id: 11, date: "2026-07-05", pays: "826", typeCible: "entreprise", cible: "Thames Research", secteur: "Recherche", type: "Espionnage", apt: "G0059", confiance: "Moyenne", resume: "Faux profils de journalistes pour piéger des chercheurs." },
  { id: 12, date: "2026-09-02", pays: "392", typeCible: "entreprise", cible: "Hoshi Electronics", secteur: "Industrie", type: "Espionnage", apt: "G0096", confiance: "Faible", resume: "Accès persistant à la messagerie de la direction." },
  { id: 13, date: "2026-10-05", pays: "076", typeCible: "entreprise", cible: "Loja Exemplo", secteur: "Commerce", type: "Fuite de données", apt: null, confiance: "—", resume: "Base clients exposée par un serveur mal configuré." },
  { id: 14, date: "2026-08-14", pays: "410", typeCible: "gouvernement", cible: "Institut de défense fictif", secteur: "Défense", type: "Espionnage", apt: "G0032", confiance: "Moyenne", resume: "Logiciel de signature électronique détourné pour diffuser un malware." },
];

// Groupes APT réels (fiches MITRE ATT&CK). "cibles" = pays où ils apparaissent dans nos exemples.
export const groupesApt = [
  { id: "G0007", nom: "APT28", alias: "Fancy Bear, Sofacy", origine: "Russie", secteurs: "Gouvernement, défense, médias", cibles: ["250", "276", "804"] },
  { id: "G0016", nom: "APT29", alias: "Cozy Bear, The Dukes", origine: "Russie", secteurs: "Gouvernement, diplomatie, santé", cibles: ["840", "826"] },
  { id: "G0034", nom: "Sandworm Team", alias: "Voodoo Bear, IRIDIUM", origine: "Russie", secteurs: "Énergie, télécoms, gouvernement", cibles: ["804", "250"] },
  { id: "G0032", nom: "Lazarus Group", alias: "HIDDEN COBRA, Guardians of Peace", origine: "Corée du Nord", secteurs: "Finance, cryptomonnaie, défense", cibles: ["840", "410", "392"] },
  { id: "G0096", nom: "APT41", alias: "Wicked Panda, Double Dragon", origine: "Chine", secteurs: "Industrie, santé, jeux vidéo", cibles: ["276", "392", "840"] },
  { id: "G0059", nom: "Magic Hound", alias: "APT35, Charming Kitten", origine: "Iran", secteurs: "Recherche, médias, gouvernement", cibles: ["826", "840"] },
];
