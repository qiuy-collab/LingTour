import {
  fetchHomeDataServer,
  fetchStoreProductsServer,
  fetchRoutesServerForHome,
  fetchEventsServer,
} from "@/lib/server-data";
import HomeClient from "./HomeClient";

export const revalidate = 60; // ISR: revalidate every 60 seconds

export default async function HomePage() {
  const [homeData, products, routes, events] = await Promise.all([
    fetchHomeDataServer("en"),
    fetchStoreProductsServer("en"),
    fetchRoutesServerForHome("en"),
    fetchEventsServer("en"),
  ]);

  return (
    <HomeClient
      initialHomeData={homeData}
      initialProducts={products}
      initialRoutes={routes}
      initialEvents={events}
    />
  );
}
