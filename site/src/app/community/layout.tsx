import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Field Notes | Culvoy Guangdong",
  description:
    "Traveller notes from Guangdong — what people found in the markets, temples, and tea houses, and what the editors think is worth chasing next.",
  openGraph: {
    title: "Field Notes | Culvoy Guangdong",
    description:
      "Traveller notes from Guangdong's markets, temples, and tea houses.",
  },
};

export default function CommunityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
