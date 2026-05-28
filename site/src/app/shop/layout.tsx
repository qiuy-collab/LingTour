import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shop | LingTour Guangdong",
  description:
    "Browse Lingnan-inspired cultural products — handcrafted goods, local delicacies, and artisan collections tied to Guangdong's story routes.",
  openGraph: {
    title: "Shop | LingTour Guangdong",
    description:
      "Browse Lingnan-inspired cultural products and artisan collections from Guangdong.",
  },
};

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
