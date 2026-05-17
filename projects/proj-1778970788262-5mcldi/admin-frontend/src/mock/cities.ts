import type { City } from '@/types/city'

// ============================================
// Mock 城市数据（3条，含完整 sections 嵌套）
// ============================================

export const mockCities: City[] = [
  {
    id: 'city-001',
    slug: 'guangzhou',
    name: '广州',
    nameEn: 'Guangzhou',
    regionLabel: 'Pearl River Delta',
    adcode: 440100,
    heroImage: 'https://picsum.photos/seed/gz-hero/1200/600',
    heroNarrative:
      '广州，一座两千年来从未关闭的港口城市。从海上丝绸之路的起点到改革开放的前沿，这座城市的脉搏始终与世界共振。',
    tags: ['Guangfu', 'Trade', 'Food', 'History', 'Urban'],
    editorIntro:
      '作为岭南文化的中心，广州将千年商都的烟火气与现代都市的活力完美融合。早茶、骑楼、西关大屋与珠江新城的摩天楼交织成一幅独特的城市画卷。',
    galleryImages: [
      'https://picsum.photos/seed/gz-gallery1/800/600',
      'https://picsum.photos/seed/gz-gallery2/800/600',
      'https://picsum.photos/seed/gz-gallery3/800/600',
    ],
    foodTitle: '不只是早茶',
    foodTitleEn: 'Beyond Dim Sum',
    foodDescription:
      '广州是名副其实的美食之都。"食在广州"绝非虚言——从清晨的虾饺烧卖到深夜的砂锅粥，从街边的牛杂到米其林三星，这座城市用味觉书写着两千年的商贸史。',
    foodImages: [
      'https://picsum.photos/seed/gz-food1/800/600',
      'https://picsum.photos/seed/gz-food2/800/600',
    ],
    sections: [
      {
        id: 'sec-gz-01',
        title: '千年商都的基因',
        body: '广州的商贸基因可以追溯到秦汉时期。作为海上丝绸之路的主要起点，广州港在唐宋时期已是世界著名大港。今天，你仍能在十三行、沙面、一德路感受到那股浓厚的商业气息——不是冰冷的交易，而是充满人情味的市井繁华。每一座骑楼都是一段商业史的缩影。',
        image: 'https://picsum.photos/seed/gz-sec1/800/400',
        statLabel: '连续开放年数',
        statValue: '2,000+',
        breathImage: 'https://picsum.photos/seed/gz-breath1/1200/400',
        breathQuote: '海上丝绸之路从这里出发，把中国带向了世界。',
        sortOrder: 1,
      },
      {
        id: 'sec-gz-02',
        title: '西关风情与骑楼记忆',
        body: '西关，广州最富烟火气的老城区。大屋的木趟栊、青砖石脚、满洲窗，承载着"西关小姐"的优雅传说。而连绵的骑楼街——恩宁路、上下九、第十甫——则构成了世界上最大的骑楼建筑群。在骑楼下穿行，晴天不晒、雨天不湿，这是广州人独有的城市智慧。',
        image: 'https://picsum.photos/seed/gz-sec2/800/400',
        statLabel: '骑楼建筑群',
        statValue: '全球最大',
        breathImage: 'https://picsum.photos/seed/gz-breath2/1200/400',
        breathQuote: '骑楼之下，是广州人最自在的生活剧场。',
        sortOrder: 2,
      },
    ],
    stats: [
      '常住人口 1,800万+',
      '建城历史 2,200年+',
      '米其林星级餐厅 20+',
      '骑楼街区 36条',
    ],
    quotes: [
      '广州是一个可以吃到任何东西的地方。——蔡澜',
      '千年商都，从未关上门。',
    ],
    breathImages: [
      'https://picsum.photos/seed/gz-bimg1/1200/400',
      'https://picsum.photos/seed/gz-bimg2/1200/400',
    ],
    status: 'published',
  },
  {
    id: 'city-002',
    slug: 'zhanjiang',
    name: '湛江',
    nameEn: 'Zhanjiang',
    regionLabel: 'Southern coast',
    adcode: 440800,
    heroImage: 'https://picsum.photos/seed/zj-hero/1200/600',
    heroNarrative:
      '雷州半岛南端的滨海之城，中国大陆最南端的热带风情。这里是海鲜的天堂、火山的遗迹、红土地的故乡。',
    tags: ['Coastal', 'Seafood', 'Volcano', 'Nature', 'Tropical'],
    editorIntro:
      '湛江拥有中国最长的海岸线之一，火山与海水交汇形成的独特地貌，孕育了丰富的海洋文化和热带农业。这里的生蚝、龙虾、鲍鱼，是广东人餐桌上的顶级食材。',
    galleryImages: [
      'https://picsum.photos/seed/zj-gallery1/800/600',
      'https://picsum.photos/seed/zj-gallery2/800/600',
      'https://picsum.photos/seed/zj-gallery3/800/600',
    ],
    foodTitle: '中国海鲜美食之都',
    foodTitleEn: "China's Seafood Capital",
    foodDescription:
      '湛江海鲜以"鲜、活、肥、美"著称。东海岛的龙虾、硇洲岛的鲍鱼、官渡的生蚝、徐闻的对虾——每一种都带着南海的咸鲜。最地道的吃法是白灼，蘸一点生抽和沙姜，就是海洋最纯粹的味道。',
    foodImages: [
      'https://picsum.photos/seed/zj-food1/800/600',
      'https://picsum.photos/seed/zj-food2/800/600',
    ],
    sections: [
      {
        id: 'sec-zj-01',
        title: '火山与海洋的交响',
        body: '湛江地处雷琼火山群，是中国最大的火山地貌分布区之一。湖光岩玛珥湖是世界上保存最完好的火山口湖之一，湖水清澈如镜，四周火山岩壁环绕。而硇洲岛则是一座活火山岛，黑色的玄武岩柱与蔚蓝的海水形成震撼的视觉对比。',
        image: 'https://picsum.photos/seed/zj-sec1/800/400',
        statLabel: '海岸线长度',
        statValue: '2,043 km',
        breathImage: 'https://picsum.photos/seed/zj-breath1/1200/400',
        breathQuote: '火山睡了，海水醒了，湛江的故事才刚刚开始。',
        sortOrder: 1,
      },
      {
        id: 'sec-zj-02',
        title: '雷州半岛的红土文明',
        body: '雷州半岛的红土地，是中国最独特的农业景观之一。"菠萝的海"——徐闻的菠萝种植区——在收获季节是一片金色的海洋。雷州的石狗文化、雷剧、雷歌，是岭南地区保存最完整的非物质文化遗产之一。这片红色土地孕育了与岭南其他地区截然不同的文化气质。',
        image: 'https://picsum.photos/seed/zj-sec2/800/400',
        statLabel: '菠萝产量',
        statValue: '全国 1/3',
        breathImage: 'https://picsum.photos/seed/zj-breath2/1200/400',
        breathQuote: '红土地上的每一个日出，都是对勤劳的礼赞。',
        sortOrder: 2,
      },
    ],
    stats: [
      '海岸线 2,043 km',
      '中国海鲜美食之都',
      '火山口湖 1座（世界唯二的玛珥湖）',
      '菠萝产量占全国 1/3',
    ],
    quotes: [
      '湛江的海鲜，是南海赠予人类最慷慨的礼物。',
      '在湛江，每一口空气都有海的味道。',
    ],
    breathImages: [
      'https://picsum.photos/seed/zj-bimg1/1200/400',
      'https://picsum.photos/seed/zj-bimg2/1200/400',
    ],
    status: 'published',
  },
  {
    id: 'city-003',
    slug: 'chaozhou',
    name: '潮州',
    nameEn: 'Chaozhou',
    regionLabel: 'Eastern coast',
    adcode: 445100,
    heroImage: 'https://picsum.photos/seed/cz-hero/1200/600',
    heroNarrative:
      '一座活着的古城。广济桥的石墩千年不倒，工夫茶的香气弥漫街巷，潮绣的金线依旧闪耀。潮州用时间证明：文化可以是一条流淌的河。',
    tags: ['Chaoshan', 'Craft', 'Tea', 'History', 'Architecture'],
    editorIntro:
      '潮州是潮汕文化的发源地，是"中国瓷都"、"中国工艺美术之都"。这里的每一座牌坊、每一盏工夫茶、每一件潮绣作品，都在诉说着一个关于精致与坚守的故事。',
    galleryImages: [
      'https://picsum.photos/seed/cz-gallery1/800/600',
      'https://picsum.photos/seed/cz-gallery2/800/600',
      'https://picsum.photos/seed/cz-gallery3/800/600',
    ],
    foodTitle: '工夫茶的哲学',
    foodTitleEn: 'The Philosophy of Gongfu Tea',
    foodDescription:
      '潮州工夫茶不是简单的饮茶方式，而是一种生活哲学。三个小杯、一壶好茶、一套21道工序，在"关公巡城、韩信点兵"的仪式中，品出的是潮州人对待生活的态度——精工细作、不疾不徐。搭配手打牛肉丸、蚝烙、粿条，是潮州最地道的打开方式。',
    foodImages: [
      'https://picsum.photos/seed/cz-food1/800/600',
      'https://picsum.photos/seed/cz-food2/800/600',
    ],
    sections: [
      {
        id: 'sec-cz-01',
        title: '广济桥：中国古代桥梁的巅峰',
        body: '广济桥（湘子桥）是中国四大古桥之一，建于南宋时期。它的独特之处在于"十八梭船廿四洲"的结构——集梁桥、浮桥、拱桥于一体，是世界上最早的启闭式桥梁。每天傍晚，中间一段浮桥会被解开让船只通行，清晨再重新合拢，这个传统延续了八百多年。',
        image: 'https://picsum.photos/seed/cz-sec1/800/400',
        statLabel: '建桥历史',
        statValue: '850+ 年',
        breathImage: 'https://picsum.photos/seed/cz-breath1/1200/400',
        breathQuote: '"到潮不到桥，枉费走一遭。"——潮州民谚',
        sortOrder: 1,
      },
      {
        id: 'sec-cz-02',
        title: '潮绣与金漆木雕：指尖上的非遗',
        body: '潮绣是中国四大名绣之一粤绣的重要分支，以金线绣、绒线绣著称。每一件潮绣作品都需要数万甚至数十万针的手工，龙的鳞片、凤的羽毛栩栩如生。而潮州金漆木雕则以多层镂空雕闻名，一座祠堂的门楣可能需要匠人数年的心血。这些手艺，是潮州人对"精致"二字最极致的诠释。',
        image: 'https://picsum.photos/seed/cz-sec2/800/400',
        statLabel: '国家级非遗',
        statValue: '17 项',
        breathImage: 'https://picsum.photos/seed/cz-breath2/1200/400',
        breathQuote: '一针一线，一刀一刻，都是时光的刻度。',
        sortOrder: 2,
      },
    ],
    stats: [
      '国家级非遗 17 项',
      '广济桥 850年+历史',
      '潮绣工序 100+ 道',
      '中国工艺美术之都',
    ],
    quotes: [
      '潮州是一座把时间过慢了的城市。',
      '工夫茶里，泡的不是茶，是人生。',
    ],
    breathImages: [
      'https://picsum.photos/seed/cz-bimg1/1200/400',
      'https://picsum.photos/seed/cz-bimg2/1200/400',
    ],
    status: 'published',
  },
]

/** 生成 UUID */
export function generateId(): string {
  return 'id-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 9)
}
