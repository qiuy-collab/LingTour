import { common } from "./common";
import { home } from "./home";
import { culture } from "./culture";
import { routes } from "./routes";
import { interpreting } from "./interpreting";
import { shop } from "./shop";
import { about } from "./about";
import { account } from "./account";
import { checkout } from "./checkout";

type DictValue = string | number | boolean | null | undefined;

// The storefront ships a single English copy deck. These modules are a central
// place to edit UI strings, not a translation layer: body content comes from
// the CMS and is authored in English there too.
const allModules = [
  common,
  home,
  culture,
  routes,
  interpreting,
  shop,
  about,
  account,
  checkout,
];

export const dictionary: Record<string, DictValue> = {};

for (const mod of allModules) {
  Object.assign(dictionary, mod.en);
}

/** Look up a UI string. Returns a readable marker when the key is missing. */
export function translate(key: string): string {
  const val = dictionary[key];
  if (val !== undefined && val !== null) return String(val);
  return `Missing copy: ${key}`;
}

/** All copy keys, for debugging. */
export function getKeys(): string[] {
  return Object.keys(dictionary);
}
