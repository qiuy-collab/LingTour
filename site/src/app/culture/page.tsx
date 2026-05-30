import { fetchCityCulturesServer } from "@/lib/server-data";
import CulturePageClient from "./CulturePageClient";

export const revalidate = 60;

export default async function CulturePage() {
  const cityCultures = await fetchCityCulturesServer("en");

  return <CulturePageClient initialCityCultures={cityCultures} />;
}
