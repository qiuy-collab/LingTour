import { Locale } from "@/lib/locale";

export interface EventData {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  city: string;
  citySlug: string;
  adcode: number;
  tags: string[];
  summary: string;
  relatedRouteSlugs: string[];
  image: string;
}

export const mockEvents: Record<Locale, EventData[]> = {
  en: [
    {
      id: "zhanjiang-nianli",
      title: "Zhanjiang Nianli Festival",
      date: "2026-05-28",
      city: "Zhanjiang",
      citySlug: "zhanjiang",
      adcode: 440800,
      tags: ["Folklore", "Feast", "Heritage"],
      summary: "Experience the grand village feasts and ritual parades of western Guangdong's most vital tradition.",
      relatedRouteSlugs: ["southern-sea-table"],
      image: "https://images.unsplash.com/photo-1590402444582-43d16d655f97?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: "chaozhou-dragon-boat",
      title: "Chaozhou Dragon Boat Race",
      date: "2026-06-19",
      city: "Chaozhou",
      citySlug: "chaozhou",
      adcode: 445100,
      tags: ["Festival", "Sport", "Culture"],
      summary: "Witness the intense rhythmic racing on the Han River, accompanied by traditional Chaozhou gongs.",
      relatedRouteSlugs: ["chaozhou-tradition"],
      image: "https://images.unsplash.com/photo-1576483523443-44dbffdd810d?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: "xiashan-night-market",
      title: "Xiashan Harbour Night Market Week",
      date: "2026-05-15",
      city: "Zhanjiang",
      citySlug: "zhanjiang",
      adcode: 440800,
      tags: ["Seafood", "Nightlife", "Local"],
      summary: "A special week celebrating colonial-era harbour architecture and the freshest midnight catches.",
      relatedRouteSlugs: ["southern-sea-table"],
      image: "https://images.unsplash.com/photo-1555529733-0e670560f7e1?auto=format&fit=crop&w=800&q=80",
    }
  ],
  zh: [
    {
      id: "zhanjiang-nianli",
      title: "湛江年例民俗节",
      date: "2026-05-28",
      city: "湛江",
      citySlug: "zhanjiang",
      adcode: 440800,
      tags: ["民俗", "村宴", "非遗"],
      summary: "体验粤西最盛大的乡村盛宴与巡游仪式，感受土地最深处的生命力。",
      relatedRouteSlugs: ["southern-sea-table"],
      image: "https://images.unsplash.com/photo-1590402444582-43d16d655f97?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: "chaozhou-dragon-boat",
      title: "潮州韩江龙舟赛",
      date: "2026-06-19",
      city: "潮州",
      citySlug: "chaozhou",
      adcode: 445100,
      tags: ["节日", "竞技", "文化"],
      summary: "在韩江之滨见证激烈的龙舟竞渡，聆听震撼人心的潮州大锣鼓。",
      relatedRouteSlugs: ["chaozhou-tradition"],
      image: "https://images.unsplash.com/photo-1576483523443-44dbffdd810d?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: "xiashan-night-market",
      title: "霞山港湾夜市周",
      date: "2026-05-15",
      city: "湛江",
      citySlug: "zhanjiang",
      adcode: 440800,
      tags: ["海鲜", "夜生活", "地道"],
      summary: "在百年殖民建筑群落中，品味最地道的深夜海鲜集市与港口风情。",
      relatedRouteSlugs: ["southern-sea-table"],
      image: "https://images.unsplash.com/photo-1555529733-0e670560f7e1?auto=format&fit=crop&w=800&q=80",
    }
  ]
};
