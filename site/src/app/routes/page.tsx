import { fetchRoutesServer } from "@/lib/server-data";
import RoutesPageClient from "./RoutesPageClient";

export const revalidate = 60;

export default async function RoutesPage() {
  const routes = await fetchRoutesServer("en");

  return <RoutesPageClient initialRoutes={routes} />;
}
