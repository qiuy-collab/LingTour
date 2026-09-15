import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shop | Culvoy Guangdong",
  description:
    "Objects from the Lingnan shelf: Leizhou volcanic-clay bowls, Chaozhou teacups, and everyday pieces still made inside the province.",
  openGraph: {
    title: "Shop | Culvoy Guangdong",
    description:
      "Leizhou clay bowls, Chaozhou teacups, and pieces still made inside Guangdong.",
  },
};

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
