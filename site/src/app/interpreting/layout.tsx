import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Interpreting Services | LingTour Guangdong",
  description:
    "Book professional interpreters for your Guangdong trip. City walks, multi-day routes, and group travel support — available in English, Mandarin, and Cantonese.",
  openGraph: {
    title: "Interpreting Services | LingTour Guangdong",
    description:
      "Book professional interpreters for city walks, routes, and group travel in Guangdong.",
  },
};

export default function InterpretingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
