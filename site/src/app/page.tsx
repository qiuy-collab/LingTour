import {
  fetchHomeDataServer,
  fetchStoreProductsServer,
  fetchRoutesServerForHome,
  fetchEventsServer,
} from "@/lib/server-data";
import HomeClient from "./HomeClient";

export const revalidate = 60; // ISR: revalidate every 60 seconds

export default async function HomePage() {
  const routesPromise = fetchRoutesServerForHome();
  const [homeData, products, routes, events] = await Promise.all([
    fetchHomeDataServer(routesPromise),
    fetchStoreProductsServer(),
    routesPromise,
    fetchEventsServer(),
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
