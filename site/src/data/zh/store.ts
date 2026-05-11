import type { StoreCollection, StoreProduct } from "@/data/store";

/** Chinese store collections */
export const zhStoreCollections: StoreCollection[] = [
  {
    title: "海岸生活套装",
    route: "一张朝南的餐桌",
    href: "/routes/southern-sea-table",
    image: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1400&q=82",
    body: "来自湛江海岸的器物：火山陶器、航海工具，以及与本地手工艺传统息息相关的织物。",
  },
];

/** Chinese store products */
export const zhStoreProducts: StoreProduct[] = [
  {
    slug: "volcanic-soil-bowl",
    name: "火山土茶碗",
    collection: "Coastal Life Kit",
    price: 32,
    currency: "SGD",
    tag: "手工制作",
    image: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=900&q=82",
    story: "使用雷州半岛火山田的黏土烧制而成，承载着南部海岸深色而丰饶的质感。",
    details: {
      material: "天然火山黏土，无铅哑光釉",
      dimensions: "直径 9cm，高 5cm",
      origin: "湛江·雷州半岛",
      care: "建议手洗，不适用于微波炉。",
    },
    originTrace: {
      location: "湛江·雷州半岛",
      citySlug: "zhanjiang",
      cityName: "湛江",
      mapAdcode: 440800,
      materialSource:
        "来自硇洲岛玄武岩田的火山黏土，形成于一百万年前的更新世火山喷发。这些深色、富含矿物的土壤承载着远古火焰的记忆——每一只茶碗都铭刻着雷州半岛的地质印记。",
      craftTradition:
        "采用岭南拉坯技艺手工制作，传承了雷州海岸四代陶匠的工艺。哑光釉配方专为保留火山黏土的原始质感而设计，不掩盖其天然之美。",
      process:
        "匠人手工挖掘深色火山黏土，陈化六个月后方可成型，在脚踏辘轳上拉坯，于900°C进行素烧，施以无铅哑光釉，再于1200°C高温烧制。从泥土到茶碗，每件作品历时约三周。",
    },
    gallery: [
      "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1200&q=82",
      "https://images.unsplash.com/photo-1594910413523-d2391693c004?auto=format&fit=crop&w=1200&q=82",
      "https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=1200&q=82",
    ],
  },
];
