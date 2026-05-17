export type CommunityPost = {
  id: string;
  user: {
    name: string;
    handle: string;
    avatar: string;
  };
  image: string;
  title: string;
  excerpt: string;
  location: string;
  route: string;
  date: string;
  readTime: string;
  channel: "Field Notes" | "Food Map" | "Hidden Stop" | "Culture Desk";
  mood: string;
  tags: string[];
  likes: number;
  comments: number;
  saves: number;
  prompt: string;
};

export const communityPosts: CommunityPost[] = [
  {
    id: "p1",
    user: {
      name: "Maya Chen",
      handle: "@maya.trails",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop",
    },
    image: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=1200&h=900&fit=crop",
    title: "A blue hour walk around Huguangyan",
    excerpt: "Arrive before the tour buses. The crater lake is quiet enough to hear shoes on stone and birds moving through the banyan shade.",
    location: "Zhanjiang",
    route: "Lake Loop",
    date: "May 10",
    readTime: "3 min",
    channel: "Field Notes",
    mood: "Slow morning",
    tags: ["Lake", "Easy walk", "Photo spot"],
    likes: 142,
    comments: 18,
    saves: 36,
    prompt: "Ask for the east gate path if you want the calmest first view.",
  },
  {
    id: "p2",
    user: {
      name: "David Li",
      handle: "@david.dawn",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop",
    },
    image: "https://images.unsplash.com/photo-1559737558-2f5a35f4523b?w=1200&h=900&fit=crop",
    title: "The seafood auction before breakfast",
    excerpt: "A local guide translated the bids, but the rhythm was already clear: baskets, hand signs, steam, and a city waking up through food.",
    location: "Zhanjiang",
    route: "Seafood Dawn",
    date: "May 08",
    readTime: "4 min",
    channel: "Food Map",
    mood: "Loud and fresh",
    tags: ["Market", "Seafood", "Early start"],
    likes: 98,
    comments: 12,
    saves: 28,
    prompt: "Wear washable shoes and leave room for breakfast nearby.",
  },
  {
    id: "p3",
    user: {
      name: "Sophie Wang",
      handle: "@sophie.routes",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&h=120&fit=crop",
    },
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1200&h=900&fit=crop",
    title: "Xiashan streets after the rain",
    excerpt: "The old facades look different when the pavement is wet. Walk slowly and the route becomes less about buildings, more about texture.",
    location: "Zhanjiang",
    route: "Old Streets",
    date: "May 05",
    readTime: "5 min",
    channel: "Culture Desk",
    mood: "Soft weather",
    tags: ["Architecture", "History", "Rain walk"],
    likes: 203,
    comments: 27,
    saves: 61,
    prompt: "Bring a small umbrella. The best photos happen between showers.",
  },
  {
    id: "p4",
    user: {
      name: "Alex Zhang",
      handle: "@alex.coast",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&h=120&fit=crop",
    },
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&h=900&fit=crop",
    title: "Naozhou feels farther than it is",
    excerpt: "The island is not difficult, but it asks for patience: ferry time, wind, volcanic stone, and a slower clock once you land.",
    location: "Zhanjiang",
    route: "Island Day",
    date: "May 02",
    readTime: "4 min",
    channel: "Hidden Stop",
    mood: "Windy escape",
    tags: ["Island", "Basalt", "Ferry"],
    likes: 176,
    comments: 22,
    saves: 44,
    prompt: "Check the return ferry first. Then let the day open up.",
  },
  {
    id: "p5",
    user: {
      name: "Lina Huang",
      handle: "@lina.harvest",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop",
    },
    image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=1200&h=900&fit=crop",
    title: "A pineapple field is also a calendar",
    excerpt: "Leizhou harvest season has its own smell: warm fruit, soil, roadside stalls, and a sweetness that makes the detour worth it.",
    location: "Leizhou",
    route: "Harvest Road",
    date: "Apr 28",
    readTime: "2 min",
    channel: "Food Map",
    mood: "Golden heat",
    tags: ["Fruit", "Road trip", "Seasonal"],
    likes: 87,
    comments: 9,
    saves: 19,
    prompt: "Ask the stall owner which fruit was cut today.",
  },
  {
    id: "p6",
    user: {
      name: "Ryan Wu",
      handle: "@ryan.makes",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&h=120&fit=crop",
    },
    image: "https://images.unsplash.com/photo-1594910413523-d2391693c004?w=1200&h=900&fit=crop",
    title: "Clay, hands, and a quiet workshop",
    excerpt: "A pottery stop turned into the most focused hour of the trip. No big landmark, just earth, pressure, and a cup taking shape.",
    location: "Naozhou",
    route: "Craft Stop",
    date: "Apr 25",
    readTime: "3 min",
    channel: "Culture Desk",
    mood: "Hands-on",
    tags: ["Craft", "Workshop", "Local maker"],
    likes: 134,
    comments: 15,
    saves: 33,
    prompt: "Book ahead if you want a real making session, not just a visit.",
  },
];
