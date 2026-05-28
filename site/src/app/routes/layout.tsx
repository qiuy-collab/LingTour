import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Story Routes | LingTour Guangdong",
  description:
    "Follow curated story-driven routes across Guangdong. Each route weaves together local food, cultural landmarks, and hidden stops with a dedicated interpreter guide.",
  openGraph: {
    title: "Story Routes | LingTour Guangdong",
    description:
      "Follow curated story-driven routes across Guangdong with food, culture, and hidden stops.",
  },
};

export default function RoutesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
