import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Culture & Cities | LingTour Guangdong",
  description:
    "Explore Guangdong's diverse city cultures — from Cantonese heritage in Guangzhou to Teochew traditions in Shantou. Discover food, history, and hidden stories across Lingnan.",
  openGraph: {
    title: "Culture & Cities | LingTour Guangdong",
    description:
      "Explore Guangdong's diverse city cultures — from Cantonese heritage in Guangzhou to Teochew traditions in Shantou.",
  },
};

export default function CultureLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
