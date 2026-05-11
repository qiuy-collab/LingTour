import type { CityCulture } from "@/data/culture";
import { zhRegionShowcase } from "./home";

/**
 * Chinese city culture details — stored as a lookup by slug.
 * Matches the same `Pick<CityCulture, "sections" | "stats" | "quotes" | "foodImages" | "breathImages">`
 * structure as the English data/culture.ts.
 */
const zhCityCultureDetails: Record<
  string,
  Pick<CityCulture, "sections" | "stats" | "quotes" | "foodImages" | "breathImages">
> = {
  zhanjiang: {
    stats: [
      "1,243 公里海岸线 · 100+ 座离岛 · 3 个国家级自然保护区",
      "100+ 个渔村 · 10,000+ 个以海为生的家庭",
      "80+ 座火山锥 · 跨越 100 万年的地质塑造",
    ],
    quotes: [
      "这不是一条你拍一张照片就够的海岸线。它是一个日常节奏：潮汐、市场的叫卖声、清晨渔获的咸甜气味。",
      "今晚餐桌上的东西，今早还在开阔的海水中。湛江不坐在海边——它活在海上。",
    ],
    foodImages: [
      "https://images.unsplash.com/photo-1559737558-2f5a35f4523b?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=800&q=80",
    ],
    breathImages: [
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1400&q=80",
    ],
    sections: [
      {
        title: "南方海岸",
        body: "湛江位于中国大陆最南端，面朝南海，拥有 1,243 公里海岸线。它不是珠三角。这里没有工厂集群和高速路网，取而代之的是绵延数公里、不见高楼的海滩，被海浪削平成为平台的黑色玄武岩岬角，红树林河口，以及 100 多座离岛——硇洲岛、东海岛、雷州岛。\n\n海岸遵循着日常节奏。黎明属于渔船，穿过避风航道驶向大海。上午，渔获进入市场。正午，全城开饭。午后，海滩上满是在游泳的人。黄昏时分，海岸归还给海洋。\n\n对旅行者而言，这不是一个驱车一瞥的目的地。这是一个需要你行走、品尝和凝视的地方。南方海岸标记着广东从河流文明变成海洋文明的那条分界线。",
      },
      {
        title: "渔村",
        body: "在湛江，渔业不是展览品。它是经济结构、日历和社会织体。几乎每条水道和河口都有一个面朝大海的渔村。房屋用珊瑚石或混凝土建成。日出之前一天就开始了——渔船穿过水道，船灯在夜色中闪烁。\n\n这些渔村有自己的运行逻辑。男人出海；女人分拣渔获、销售、腌制储存；小孩学鱼名的年龄比学路名还早。村长识别天气模式就像城里人看地铁图一样自然。\n\n市场是理解这个世界的最佳场所。它不是为游客设计的。地面是湿的，碎冰在发光。讨价还价用雷州闽语进行——一种连粤语使用者都听不懂的语言。穿过市场，你通过餐桌上的东西来阅读海岸：银色鲭鱼、粉色虾、深绿色海藻——昨夜航行的色彩。\n\n这些社区正面临压力。年轻人在往城市迁徙；工业船队与传统渔船竞争；气候变化正在改变鱼群分布。此刻到访，你看到的是一种仍然活着但不保证会永远持续的生活方式。",
      },
      {
        title: "火山地貌",
        body: "很少有旅行者预料到会在广东发现火山。但雷州半岛——湛江南半部——是由过去数百万年的喷发塑造而成的。其结果是一片与省内其他地方截然不同的地貌：黑色玄武岩露头、暗色肥沃土壤，以及熔岩曾经与海洋相遇的海岸线。\n\n观赏这一地貌的最佳地点是硇洲岛，六棱形玄武岩石柱从水中升起。由熔岩缓慢冷却形成，它们以几何队列排列着，仿佛一座为海洋建造的管风琴。行走在这片海岸上，你能感受到这个地方的深层时间：构造碰撞、熔岩，以及将烈火转化为土壤的漫长风化过程。\n\n火山土壤滋养着湛江的农场。菠萝种植园、甘蔗田和香蕉林都得益于远古喷发的肥力。这里的深色土壤能保持沙质三角洲土壤无法持有的水分和矿物质。菠萝更甜。蔬菜长得更快。从过去的火山到今日餐桌的丰盛——有一条清晰的线索，任何留心的人都能看见。\n\n从广州或深圳来到这里，这片地形会带来一种冲击。珠三角让人感觉被规划、被管理、被铺设。湛江的火山地貌是不受统治的。它提醒人们：广东不仅仅是商业与高铁的省份，它也是地质力量、热带农业和被地质时间塑造的海岸线的省份。",
      },
    ],
  },
};

/**
 * Full Chinese city cultures array — merged from zhRegionShowcase + zhCityCultureDetails.
 * Mirrors the English `cityCultures` export from data/culture.ts.
 */
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
    routeSlugs: city.routeSlugs,
    stats: details?.stats ?? [],
    quotes: details?.quotes ?? [],
    foodImages: details?.foodImages ?? [],
    breathImages: details?.breathImages ?? [],
    sections: details?.sections ?? [
      {
        title: "当地文化",
        body: city.narrative,
      },
    ],
  };
});
