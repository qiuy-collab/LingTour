import type { CityCulture } from "@/data/culture";
import { zhRegionShowcase } from "./home";

const zhCityCultureDetails: Record<
  string,
  Pick<CityCulture, "sections" | "foodImages">
> = {
  zhanjiang: {
    foodImages: [
      "https://images.unsplash.com/photo-1559737558-2f5a35f4523b?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=800&q=80",
    ],
    sections: [
      {
        title: "南方海岸",
        body: "湛江位于中国大陆最南端，面朝南海。这里的节奏由海定义：清晨出海，中午进市，黄昏归岸。它不是匆匆路过的目的地，而是一个需要你慢慢走、慢慢吃、慢慢看的地方。",
        image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=80",
        stat: "1,243 公里海岸线 / 100+ 离岛 / 3 个国家级自然保护区",
        breathImage: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=80",
        breathQuote: "这不是拍一张照就结束的海岸线，它是一整天的生活节奏。",
      },
      {
        title: "渔村",
        body: "在湛江，渔业不是展品，而是经济、日历与社区结构本身。沿着水道与入海口，几乎每一处都能看到面向大海的渔村。市场里湿滑的地面、冰块反光和方言叫卖，一起构成了这里真正的城市声音。",
        image: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1400&q=80",
        stat: "100+ 个渔村 / 10,000+ 个以海为生的家庭",
        breathImage: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1400&q=80",
        breathQuote: "今晚餐桌上的东西，今天清晨还在海里。",
      },
      {
        title: "火山地貌",
        body: "雷州半岛由漫长的火山活动塑造而成。黑色玄武岩、肥沃火山土和与海相接的地貌，让这里和珠三角呈现出完全不同的气质。土地的味道，最后都会回到餐桌上。",
        image: "https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=1400&q=80",
        stat: "80+ 座火山锥 / 跨越上百万年的地质塑造",
      },
    ],
  },
};

export const zhCityCultures: CityCulture[] = zhRegionShowcase.map((city) => {
  const details = zhCityCultureDetails[city.slug];
  return {
    slug: city.slug,
    name: city.name,
    adcode: city.adcode,
    label: city.label,
    summary: city.summary,
    narrative: city.narrative,
    image: city.image,
    gallery: city.gallery,
    tags: city.tags,
    food: city.food,
    foodDescription: city.narrative,
    routeSlugs: city.routeSlugs,
    relatedCitySlugs: [],
    foodImages: details?.foodImages ?? [],
    sections: details?.sections ?? [
      {
        title: "本地文化",
        body: city.narrative,
        image: city.image,
      },
    ],
  };
});
