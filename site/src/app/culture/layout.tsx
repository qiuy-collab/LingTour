import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Culture & Cities | Culvoy Guangdong",
  description:
    "City culture across Guangdong: Chaozhou's gongfu tea, Guangzhou's qilou arcades and morning tea, Hakka round-walled houses in the hills — three traditions, one province.",
  openGraph: {
    title: "Culture & Cities | Culvoy Guangdong",
    description:
      "Chaozhou's gongfu tea, Guangzhou's qilou arcades, Hakka round-walled houses — three traditions, one province.",
  },
};

export default function CultureLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
