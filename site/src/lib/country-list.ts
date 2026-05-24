import type { Locale } from "@/lib/locale";

export const COUNTRY_CODES = [
  "AF", "AX", "AL", "DZ", "AS", "AD", "AO", "AI", "AQ", "AG", "AR", "AM", "AW", "AU", "AT", "AZ",
  "BS", "BH", "BD", "BB", "BY", "BE", "BZ", "BJ", "BM", "BT", "BO", "BQ", "BA", "BW", "BV", "BR",
  "IO", "BN", "BG", "BF", "BI", "CV", "KH", "CM", "CA", "KY", "CF", "TD", "CL", "CN", "CX", "CC",
  "CO", "KM", "CG", "CD", "CK", "CR", "CI", "HR", "CU", "CW", "CY", "CZ", "DK", "DJ", "DM", "DO",
  "EC", "EG", "SV", "GQ", "ER", "EE", "SZ", "ET", "FK", "FO", "FJ", "FI", "FR", "GF", "PF", "TF",
  "GA", "GM", "GE", "DE", "GH", "GI", "GR", "GL", "GD", "GP", "GU", "GT", "GG", "GN", "GW", "GY",
  "HT", "HM", "VA", "HN", "HK", "HU", "IS", "IN", "ID", "IR", "IQ", "IE", "IM", "IL", "IT", "JM",
  "JP", "JE", "JO", "KZ", "KE", "KI", "KP", "KR", "KW", "KG", "LA", "LV", "LB", "LS", "LR", "LY",
  "LI", "LT", "LU", "MO", "MG", "MW", "MY", "MV", "ML", "MT", "MH", "MQ", "MR", "MU", "YT", "MX",
  "FM", "MD", "MC", "MN", "ME", "MS", "MA", "MZ", "MM", "NA", "NR", "NP", "NL", "NC", "NZ", "NI",
  "NE", "NG", "NU", "NF", "MK", "MP", "NO", "OM", "PK", "PW", "PS", "PA", "PG", "PY", "PE", "PH",
  "PN", "PL", "PT", "PR", "QA", "RE", "RO", "RU", "RW", "BL", "SH", "KN", "LC", "MF", "PM", "VC",
  "WS", "SM", "ST", "SA", "SN", "RS", "SC", "SL", "SG", "SX", "SK", "SI", "SB", "SO", "ZA", "GS",
  "SS", "ES", "LK", "SD", "SR", "SJ", "SE", "CH", "SY", "TW", "TJ", "TZ", "TH", "TL", "TG", "TK",
  "TO", "TT", "TN", "TR", "TM", "TC", "TV", "UG", "UA", "AE", "GB", "UM", "US", "UY", "UZ", "VU",
  "VE", "VN", "VG", "VI", "WF", "EH", "YE", "ZM", "ZW",
];

const LEGACY_COUNTRY_ALIASES: Record<string, string> = {
  china: "CN",
  "people's republic of china": "CN",
  singapore: "SG",
  japan: "JP",
  korea: "KR",
  "south korea": "KR",
  "hong kong": "HK",
  macao: "MO",
  macau: "MO",
  taiwan: "TW",
  malaysia: "MY",
  thailand: "TH",
  vietnam: "VN",
  "united states": "US",
  usa: "US",
  "united kingdom": "GB",
  uk: "GB",
  australia: "AU",
  canada: "CA",
};

function displayLocale(locale?: Locale) {
  return locale === "zh" ? "zh-CN" : "en";
}

export function normalizeCountryCode(value?: string | null) {
  const raw = value?.trim();
  if (!raw) return "";
  const upper = raw.toUpperCase();
  if (/^[A-Z]{2}$/.test(upper) && COUNTRY_CODES.includes(upper)) return upper;
  return LEGACY_COUNTRY_ALIASES[raw.toLowerCase()] ?? "";
}

export function countryName(codeOrLegacy?: string | null, locale?: Locale) {
  const code = normalizeCountryCode(codeOrLegacy);
  if (!code) return codeOrLegacy?.trim() || "";

  try {
    return new Intl.DisplayNames([displayLocale(locale)], { type: "region" }).of(code) ?? code;
  } catch {
    return code;
  }
}

export function countryOptions(locale?: Locale) {
  return COUNTRY_CODES
    .map((code) => ({ code, label: countryName(code, locale) || code }))
    .sort((a, b) => a.label.localeCompare(b.label, displayLocale(locale)));
}
