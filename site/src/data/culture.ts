/**
 * Type-only module: shape definitions for city culture pages.
 *
 * The hardcoded `cityCultures` array, `cityCultureDetails` map, and
 * `getCityCulture` helper that used to live here have been removed. City
 * data is now sourced from the backend via `lib/api-data` (`fetchCities`,
 * `fetchCityBySlug`).
 *
 * Pages and components keep importing the types only.
 */

export type CityCultureSection = {
  title: string;
  body: string;
  image: string;
  images?: string[];
  stat?: string;
  breathImage?: string;
  breathQuote?: string;
};

export type CityCulture = {
  slug: string;
  name: string;
  adcode: number;
  label: string;
  summary: string;
  narrative: string;
  image: string;
  gallery: string[];
  tags: string[];
  food: string;
  foodDescription: string;
  routeSlugs: string[];
  relatedCitySlugs: string[];
  foodImages: string[];
  sections: CityCultureSection[];
};
