/**
 * Maps French country/territory names to the `id` used by the embedded
 * TopoJSON (`src/data/world-countries-50m.json`, Natural Earth via
 * world-atlas). Most ids are the ISO 3166-1 numeric code (as a zero-padded
 * string, matching the TopoJSON feature `id`); a handful of features in that
 * dataset carry no numeric id (e.g. Kosovo) — for those the key is the
 * feature's English `properties.name` instead, which `WorldMap` falls back
 * to when a feature has no `id`.
 */

export type CountryKeyEntry = {
  key: string
  /** Known French names/spellings that should resolve to this map feature. */
  names: string[]
}

export const COUNTRY_KEY_ENTRIES: CountryKeyEntry[] = [
  { key: "004", names: ["Afghanistan"] },
  { key: "248", names: ["Åland", "Îles Åland"] },
  { key: "008", names: ["Albanie"] },
  { key: "012", names: ["Algérie"] },
  { key: "016", names: ["Samoa américaines"] },
  { key: "020", names: ["Andorre"] },
  { key: "024", names: ["Angola"] },
  { key: "660", names: ["Anguilla"] },
  { key: "010", names: ["Antarctique"] },
  { key: "028", names: ["Antigua-et-Barbuda", "Antigua et Barbuda"] },
  { key: "032", names: ["Argentine"] },
  { key: "051", names: ["Arménie"] },
  { key: "533", names: ["Aruba"] },
  { key: "036", names: ["Australie"] },
  { key: "040", names: ["Autriche"] },
  { key: "031", names: ["Azerbaïdjan"] },
  { key: "044", names: ["Bahamas"] },
  { key: "048", names: ["Bahreïn", "Bahrein"] },
  { key: "050", names: ["Bangladesh"] },
  { key: "052", names: ["Barbade"] },
  { key: "112", names: ["Biélorussie", "Bélarus", "Belarus"] },
  { key: "056", names: ["Belgique"] },
  { key: "084", names: ["Belize"] },
  { key: "204", names: ["Bénin"] },
  { key: "060", names: ["Bermudes"] },
  { key: "064", names: ["Bhoutan"] },
  { key: "068", names: ["Bolivie"] },
  { key: "070", names: ["Bosnie-Herzégovine", "Bosnie Herzégovine"] },
  { key: "072", names: ["Botswana"] },
  { key: "076", names: ["Brésil"] },
  { key: "092", names: ["Îles Vierges britanniques"] },
  { key: "096", names: ["Brunei"] },
  { key: "100", names: ["Bulgarie"] },
  { key: "854", names: ["Burkina Faso"] },
  { key: "108", names: ["Burundi"] },
  { key: "132", names: ["Cap-Vert"] },
  { key: "116", names: ["Cambodge"] },
  { key: "120", names: ["Cameroun"] },
  { key: "124", names: ["Canada"] },
  { key: "136", names: ["Îles Caïmans"] },
  { key: "140", names: ["République centrafricaine"] },
  { key: "148", names: ["Tchad"] },
  { key: "152", names: ["Chili"] },
  { key: "156", names: ["Chine"] },
  { key: "170", names: ["Colombie"] },
  { key: "174", names: ["Comores"] },
  { key: "178", names: ["Congo", "République du Congo", "Congo-Brazzaville"] },
  { key: "184", names: ["Îles Cook"] },
  { key: "188", names: ["Costa Rica"] },
  { key: "384", names: ["Côte d'Ivoire", "Cote d'Ivoire"] },
  { key: "191", names: ["Croatie"] },
  { key: "192", names: ["Cuba"] },
  { key: "531", names: ["Curaçao"] },
  { key: "196", names: ["Chypre"] },
  { key: "203", names: ["République tchèque", "Tchéquie"] },
  {
    key: "180",
    names: [
      "République démocratique du Congo",
      "RD Congo",
      "Congo-Kinshasa",
      "RDC",
    ],
  },
  { key: "208", names: ["Danemark"] },
  { key: "262", names: ["Djibouti"] },
  { key: "212", names: ["Dominique"] },
  { key: "214", names: ["République dominicaine"] },
  { key: "218", names: ["Équateur"] },
  { key: "818", names: ["Égypte"] },
  { key: "222", names: ["Salvador", "El Salvador"] },
  { key: "226", names: ["Guinée équatoriale"] },
  { key: "232", names: ["Érythrée"] },
  { key: "233", names: ["Estonie"] },
  { key: "748", names: ["Eswatini", "Swaziland"] },
  { key: "231", names: ["Éthiopie"] },
  { key: "234", names: ["Îles Féroé"] },
  { key: "238", names: ["Îles Malouines", "Îles Falkland"] },
  { key: "242", names: ["Fidji"] },
  { key: "246", names: ["Finlande"] },
  { key: "258", names: ["Polynésie française"] },
  { key: "260", names: ["Terres australes et antarctiques françaises"] },
  { key: "250", names: ["France"] },
  { key: "266", names: ["Gabon"] },
  { key: "270", names: ["Gambie"] },
  { key: "268", names: ["Géorgie"] },
  { key: "276", names: ["Allemagne"] },
  { key: "288", names: ["Ghana"] },
  { key: "300", names: ["Grèce"] },
  { key: "304", names: ["Groenland"] },
  { key: "308", names: ["Grenade"] },
  { key: "316", names: ["Guam"] },
  { key: "320", names: ["Guatemala"] },
  { key: "831", names: ["Guernesey"] },
  { key: "324", names: ["Guinée"] },
  { key: "624", names: ["Guinée-Bissau"] },
  { key: "328", names: ["Guyana"] },
  { key: "332", names: ["Haïti"] },
  { key: "340", names: ["Honduras"] },
  { key: "344", names: ["Hong Kong"] },
  { key: "348", names: ["Hongrie"] },
  { key: "352", names: ["Islande"] },
  { key: "356", names: ["Inde"] },
  { key: "360", names: ["Indonésie"] },
  { key: "364", names: ["Iran"] },
  { key: "368", names: ["Irak", "Iraq"] },
  { key: "372", names: ["Irlande"] },
  { key: "833", names: ["Île de Man"] },
  { key: "376", names: ["Israël"] },
  { key: "380", names: ["Italie"] },
  { key: "388", names: ["Jamaïque"] },
  { key: "392", names: ["Japon"] },
  { key: "832", names: ["Jersey"] },
  { key: "400", names: ["Jordanie"] },
  { key: "398", names: ["Kazakhstan"] },
  { key: "404", names: ["Kenya"] },
  { key: "296", names: ["Kiribati"] },
  { key: "Kosovo", names: ["Kosovo"] },
  { key: "414", names: ["Koweït"] },
  { key: "417", names: ["Kirghizistan", "Kirghizstan", "Kyrgyzstan"] },
  { key: "418", names: ["Laos"] },
  { key: "428", names: ["Lettonie"] },
  { key: "422", names: ["Liban"] },
  { key: "426", names: ["Lesotho"] },
  { key: "430", names: ["Liberia", "Libéria"] },
  { key: "434", names: ["Libye"] },
  { key: "438", names: ["Liechtenstein"] },
  { key: "440", names: ["Lituanie"] },
  { key: "442", names: ["Luxembourg"] },
  { key: "446", names: ["Macao"] },
  { key: "807", names: ["Macédoine du Nord", "Macédoine"] },
  { key: "450", names: ["Madagascar"] },
  { key: "454", names: ["Malawi"] },
  { key: "458", names: ["Malaisie"] },
  { key: "462", names: ["Maldives"] },
  { key: "466", names: ["Mali"] },
  { key: "470", names: ["Malte"] },
  { key: "584", names: ["Îles Marshall"] },
  { key: "478", names: ["Mauritanie"] },
  { key: "480", names: ["Maurice", "Île Maurice"] },
  { key: "484", names: ["Mexique"] },
  { key: "583", names: ["Micronésie", "États fédérés de Micronésie"] },
  { key: "498", names: ["Moldavie"] },
  { key: "492", names: ["Monaco"] },
  { key: "496", names: ["Mongolie"] },
  { key: "499", names: ["Monténégro"] },
  { key: "500", names: ["Montserrat"] },
  { key: "504", names: ["Maroc"] },
  { key: "508", names: ["Mozambique"] },
  { key: "104", names: ["Myanmar", "Birmanie"] },
  { key: "580", names: ["Îles Mariannes du Nord"] },
  { key: "516", names: ["Namibie"] },
  { key: "520", names: ["Nauru"] },
  { key: "524", names: ["Népal"] },
  { key: "528", names: ["Pays-Bas"] },
  { key: "540", names: ["Nouvelle-Calédonie"] },
  { key: "554", names: ["Nouvelle-Zélande"] },
  { key: "558", names: ["Nicaragua"] },
  { key: "562", names: ["Niger"] },
  { key: "566", names: ["Nigeria", "Nigéria"] },
  { key: "570", names: ["Niue"] },
  { key: "574", names: ["Île Norfolk"] },
  { key: "408", names: ["Corée du Nord"] },
  { key: "578", names: ["Norvège"] },
  { key: "512", names: ["Oman"] },
  { key: "586", names: ["Pakistan"] },
  { key: "585", names: ["Palaos"] },
  { key: "275", names: ["Palestine", "Jérusalem"] },
  { key: "591", names: ["Panama"] },
  { key: "598", names: ["Papouasie-Nouvelle-Guinée"] },
  { key: "600", names: ["Paraguay"] },
  { key: "604", names: ["Pérou"] },
  { key: "608", names: ["Philippines"] },
  { key: "612", names: ["Îles Pitcairn"] },
  { key: "616", names: ["Pologne"] },
  { key: "620", names: ["Portugal"] },
  { key: "630", names: ["Porto Rico"] },
  { key: "634", names: ["Qatar"] },
  { key: "642", names: ["Roumanie"] },
  { key: "643", names: ["Russie"] },
  { key: "646", names: ["Rwanda"] },
  { key: "239", names: ["Géorgie du Sud-et-les Îles Sandwich du Sud"] },
  { key: "728", names: ["Soudan du Sud"] },
  { key: "654", names: ["Sainte-Hélène"] },
  { key: "662", names: ["Sainte-Lucie"] },
  { key: "882", names: ["Samoa"] },
  { key: "674", names: ["Saint-Marin"] },
  { key: "678", names: ["Sao Tomé-et-Principe"] },
  { key: "682", names: ["Arabie saoudite"] },
  { key: "686", names: ["Sénégal"] },
  { key: "688", names: ["Serbie"] },
  { key: "690", names: ["Seychelles"] },
  { key: "694", names: ["Sierra Leone"] },
  { key: "702", names: ["Singapour"] },
  { key: "534", names: ["Sint Maarten"] },
  { key: "703", names: ["Slovaquie"] },
  { key: "705", names: ["Slovénie"] },
  { key: "090", names: ["Îles Salomon"] },
  { key: "706", names: ["Somalie"] },
  { key: "710", names: ["Afrique du Sud"] },
  { key: "410", names: ["Corée du Sud"] },
  { key: "724", names: ["Espagne"] },
  { key: "144", names: ["Sri Lanka"] },
  { key: "652", names: ["Saint-Barthélemy"] },
  { key: "663", names: ["Saint-Martin"] },
  {
    key: "659",
    names: ["Saint-Christophe-et-Niévès", "Saint-Kitts-et-Nevis"],
  },
  { key: "666", names: ["Saint-Pierre-et-Miquelon"] },
  { key: "670", names: ["Saint-Vincent-et-les-Grenadines"] },
  { key: "729", names: ["Soudan"] },
  { key: "740", names: ["Suriname"] },
  { key: "752", names: ["Suède"] },
  { key: "756", names: ["Suisse"] },
  { key: "760", names: ["Syrie"] },
  { key: "158", names: ["Taïwan", "Taiwan"] },
  { key: "762", names: ["Tadjikistan"] },
  { key: "834", names: ["Tanzanie"] },
  { key: "764", names: ["Thaïlande"] },
  { key: "626", names: ["Timor oriental", "Timor-Leste"] },
  { key: "768", names: ["Togo"] },
  { key: "776", names: ["Tonga"] },
  { key: "780", names: ["Trinité-et-Tobago"] },
  { key: "788", names: ["Tunisie"] },
  { key: "792", names: ["Turquie", "Türkiye"] },
  { key: "795", names: ["Turkménistan"] },
  { key: "796", names: ["Îles Turques-et-Caïques"] },
  { key: "850", names: ["Îles Vierges des États-Unis"] },
  { key: "800", names: ["Ouganda"] },
  { key: "804", names: ["Ukraine"] },
  { key: "784", names: ["Émirats arabes unis"] },
  {
    key: "826",
    names: ["Royaume-Uni", "Grande-Bretagne", "Angleterre"],
  },
  {
    key: "840",
    names: ["États-Unis", "Etats-Unis", "États-Unis d'Amérique", "USA"],
  },
  { key: "858", names: ["Uruguay"] },
  { key: "860", names: ["Ouzbékistan"] },
  { key: "548", names: ["Vanuatu"] },
  { key: "336", names: ["Vatican", "Saint-Siège"] },
  { key: "862", names: ["Venezuela"] },
  { key: "704", names: ["Viêt Nam", "Vietnam"] },
  { key: "732", names: ["Sahara occidental"] },
  { key: "876", names: ["Wallis-et-Futuna"] },
  { key: "887", names: ["Yémen"] },
  { key: "894", names: ["Zambie"] },
  { key: "716", names: ["Zimbabwe"] },
]

function stripDiacritics(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
}

/**
 * Normalizes a country name for matching: strips accents, case, punctuation,
 * elisions ("l'", "d'", "qu'") and leading definite articles, so
 * "Côte d'Ivoire", "cote-d-ivoire" and "COTE D'IVOIRE" all collapse to the
 * same key.
 */
export function normalizeCountryName(raw: string): string {
  let s = stripDiacritics(raw.trim().toLowerCase())
  s = s.replace(/[’‘´`]/g, "'")
  s = s.replace(/[-_]/g, " ")
  s = s.replace(/\b(l|d|qu)'/g, "")
  s = s.replace(/[^a-z0-9' ]+/g, " ")
  s = s.replace(/^(le|la|les)\s+/, "")
  s = s.replace(/\s+/g, " ").trim()
  return s
}

const NAME_TO_KEY = new Map<string, string>()
for (const entry of COUNTRY_KEY_ENTRIES) {
  for (const name of entry.names) {
    NAME_TO_KEY.set(normalizeCountryName(name), entry.key)
  }
}

/** Resolves a (French) country name to its map feature key, if recognized. */
export function resolveCountryKey(name: string): string | undefined {
  return NAME_TO_KEY.get(normalizeCountryName(name))
}

const KEY_TO_DISPLAY_NAME = new Map<string, string>()
for (const entry of COUNTRY_KEY_ENTRIES) {
  if (!KEY_TO_DISPLAY_NAME.has(entry.key)) {
    KEY_TO_DISPLAY_NAME.set(entry.key, entry.names[0])
  }
}

/** Canonical French display name for a map feature key (see {@link resolveCountryKey}). */
export function countryDisplayName(key: string): string | undefined {
  return KEY_TO_DISPLAY_NAME.get(key)
}

/**
 * Countries whose CSL coverage is shared: when either member of a group has
 * a dated CSL entry, both map features should render as "fiche créée".
 * Each tuple holds the two members' map feature keys (see
 * {@link resolveCountryKey}).
 */
export const LINKED_COUNTRY_GROUPS: [string, string][] = [
  ["266", "678"], // Gabon & Sao Tomé-et-Principe
  ["324", "694"], // Guinée & Sierra Leone
  ["404", "706"], // Kenya & Somalie
  ["508", "748"], // Mozambique & Eswatini
  ["144", "462"], // Sri Lanka & Maldives
  ["780", "052"], // Trinité-et-Tobago & Barbade
]

/**
 * Regional / international bodies that can appear in the `pays` column
 * alongside actual countries. They have no map feature to color, so the
 * widget lists them separately instead of flagging them as unrecognized.
 */
export type OrganizationEntry = {
  /** Canonical display name. */
  name: string
  /** Known alternate spellings/abbreviations. */
  aliases?: string[]
}

export const ORGANIZATION_ENTRIES: OrganizationEntry[] = [
  { name: "Conseil de l'Europe" },
  {
    name: "Communauté du Pacifique",
    aliases: ["Commu. du Pacifique", "Communauté du pacifique", "CPS"],
  },
]

const ORGANIZATION_NAME_BY_ALIAS = new Map<string, string>()
for (const entry of ORGANIZATION_ENTRIES) {
  ORGANIZATION_NAME_BY_ALIAS.set(normalizeCountryName(entry.name), entry.name)
  for (const alias of entry.aliases ?? []) {
    ORGANIZATION_NAME_BY_ALIAS.set(normalizeCountryName(alias), entry.name)
  }
}

/** Resolves a name to a known organization's canonical name, if recognized. */
export function resolveOrganizationName(name: string): string | undefined {
  return ORGANIZATION_NAME_BY_ALIAS.get(normalizeCountryName(name))
}
