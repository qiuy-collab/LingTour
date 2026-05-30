import { fetchInterpretingServer } from "@/lib/server-data";
import InterpretingPageClient from "./InterpretingPageClient";

export const revalidate = 60;

export default async function InterpretingPage() {
  const interpretingData = await fetchInterpretingServer("en");

  return (
    <InterpretingPageClient initialInterpretingData={interpretingData} />
  );
}
