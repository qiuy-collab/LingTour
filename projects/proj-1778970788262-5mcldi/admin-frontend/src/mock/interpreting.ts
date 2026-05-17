// ============================================
// 口译服务相关 Mock 数据
// 包含: 服务模式(3) + 口译员(4) + 预约(5) + FAQ(5)
// ============================================
import type { ServiceMode, Interpreter, Booking, FAQ } from '@/types/interpreting'

// ─── ID 生成器 ──────────────────────────────────
let _modeId = 10
let _interpreterId = 20
let _bookingId = 30
let _faqId = 40

export function generateModeId(): string {
  return 'mode_' + String(_modeId++)
}
export function generateInterpreterId(): string {
  return 'interpreter_' + String(_interpreterId++)
}
export function generateBookingId(): string {
  return 'booking_' + String(_bookingId++)
}
export function generateFAQId(): string {
  return 'faq_' + String(_faqId++)
}

// ─── 服务模式 Mock ───────────────────────────────
export const mockServiceModes: ServiceMode[] = [
  {
    id: 'mode_1',
    sortOrder: 1,
    title: '按小时陪同',
    titleEn: 'Hourly Companion',
    price: '$180 / 小时',
    bestFor: '适合商务会议、短途导览、机场接送等灵活需求',
    bestForEn: 'Ideal for business meetings, short tours, airport pickups and flexible needs',
    body: '按小时计费的双语陪同服务，灵活安排时间。我们的口译员不仅是语言桥梁，更是文化向导，确保您在广东的每一刻都顺畅无阻。\n\n无论是商务谈判、工厂参观还是休闲购物，我们都能提供专业的语言支持。',
    bodyEn: 'Hourly-billed bilingual companion service with flexible scheduling. Our interpreters serve not only as language bridges but also as cultural guides, ensuring every moment in Guangdong flows smoothly.\n\nWhether for business negotiations, factory visits, or leisure shopping, we provide professional language support.',
    includes: ['一对一陪同', '实时翻译', '文化背景解读', '本地建议', '应急协助'],
    includesEn: ['One-on-one companion', 'Real-time translation', 'Cultural context', 'Local tips', 'Emergency assistance'],
    accent: 'light',
    featured: false,
  },
  {
    id: 'mode_2',
    sortOrder: 2,
    title: '半日陪同',
    titleEn: 'Half-Day Companion',
    price: '$480 / 半天',
    bestFor: '适合半日游览、专项考察、餐厅探店等深度体验',
    bestForEn: 'Perfect for half-day tours, specialized visits, restaurant explorations and in-depth experiences',
    body: '半天（4小时）的双语深度陪同服务。适合想要沉浸式体验岭南文化的旅客，我们的口译员会带领您深入大街小巷，发现最地道的广东。\n\n从清晨的茶楼早茶到午后的骑楼漫步，半天时间足以让您感受到一座城市的脉搏。',
    bodyEn: 'Half-day (4 hours) in-depth bilingual companion service. Perfect for travelers seeking immersive Lingnan cultural experiences — our interpreters lead you through alleys and lanes to discover the most authentic Guangdong.\n\nFrom morning tea at traditional tea houses to afternoon strolls through arcade streets, half a day reveals a city\'s heartbeat.',
    includes: ['深入导览', '地道美食推荐', '实时翻译', '交通协调', '应急协助'],
    includesEn: ['In-depth guiding', 'Local food recommendations', 'Real-time translation', 'Transport coordination', 'Emergency assistance'],
    accent: 'dark',
    featured: true,
  },
  {
    id: 'mode_3',
    sortOrder: 3,
    title: '全天陪同',
    titleEn: 'Full-Day Companion',
    price: '$780 / 全天',
    bestFor: '适合全天多城游、商务考察、影视拍摄协助等复杂需求',
    bestForEn: 'Ideal for full-day multi-city tours, business inspections, film production assistance and complex needs',
    body: '全天（8小时）双语全程陪同，覆盖广东省内主要城市。无论是跨城市旅行、商务全天考察，还是拍摄团队的语言协调，我们提供最全面的支持。\n\n全天服务含午餐时间协调，可配合您的行程灵活调整节奏。',
    bodyEn: 'Full-day (8 hours) bilingual end-to-end companion service covering major cities in Guangdong. Whether cross-city travel, full-day business inspection, or language coordination for film crews, we provide the most comprehensive support.\n\nFull-day service includes lunch coordination, with flexible pacing aligned to your itinerary.',
    includes: ['全程陪同', '多城市协调', '实时翻译', '商务/个人助理', '紧急联络', '本地网络接入'],
    includesEn: ['End-to-end companion', 'Multi-city coordination', 'Real-time translation', 'Business/personal assistant', 'Emergency contacts', 'Local network access'],
    accent: 'dark',
    featured: false,
  },
]

// ─── 口译员 Mock ──────────────────────────────────
export const mockInterpreters: Interpreter[] = [
  {
    id: 'interpreter_1',
    sortOrder: 1,
    name: '陈晓琳',
    language: 'English & Cantonese/Mandarin',
    focus: '岭南文化、历史考古',
    focusEn: 'Lingnan Culture, History & Archaeology',
    helps: ['深度文化解读', '非遗知识', '博物馆专业导览', '学术翻译'],
    helpsEn: ['Deep cultural interpretation', 'Intangible heritage knowledge', 'Professional museum tours', 'Academic translation'],
    avatar: 'https://picsum.photos/200/200?random=1',
    bio: '广州土著，中山大学考古学硕士。深耕岭南文化研究十余年，曾为BBC、国家地理等国际媒体团队提供口译服务。擅长将枯燥的历史知识转化为生动的故事。',
    bioEn: 'Guangzhou native with an MA in Archaeology from Sun Yat-sen University. Over a decade of Lingnan cultural research, previously interpreted for BBC, National Geographic, and other international media teams. Skilled at transforming dry historical facts into vivid stories.',
    status: 'active',
    city: '广州',
  },
  {
    id: 'interpreter_2',
    sortOrder: 2,
    name: '林伟豪',
    language: 'English & Mandarin/Teochew',
    focus: '潮汕美食、工艺美术',
    focusEn: 'Chaoshan Cuisine, Crafts & Arts',
    helps: ['美食探店', '工艺讲解', '商务陪同', '方言协助'],
    helpsEn: ['Food exploration', 'Craft explanation', 'Business companion', 'Dialect assistance'],
    avatar: 'https://picsum.photos/200/200?random=2',
    bio: '潮州人，英语专业八级，热爱潮汕美食与文化。曾带领超过200位外国游客深入潮汕，品尝最地道的美食，探访最传统的手工艺作坊。',
    bioEn: 'Chaozhou native with TEM-8 English certification, passionate about Chaoshan cuisine and culture. Has guided over 200 foreign visitors through Chaoshan, tasting the most authentic flavors and visiting traditional craft workshops.',
    status: 'active',
    city: '潮州',
  },
  {
    id: 'interpreter_3',
    sortOrder: 3,
    name: '张雨晴',
    language: 'English & Mandarin',
    focus: '当代艺术、设计建筑',
    focusEn: 'Contemporary Art, Design & Architecture',
    helps: ['艺术导览', '设计翻译', '展览陪同', '创意产业对接'],
    helpsEn: ['Art guiding', 'Design translation', 'Exhibition companion', 'Creative industry liaison'],
    avatar: 'https://picsum.photos/200/200?random=3',
    bio: '广美视觉文化硕士，曾任职于深圳设计周组委会。熟悉粤港澳大湾区的艺术生态，能提供专业的艺术设计领域口译服务。',
    bioEn: 'MA in Visual Culture from Guangzhou Academy of Fine Arts, formerly with Shenzhen Design Week committee. Well-versed in the Greater Bay Area art ecosystem, providing professional interpretation in art and design fields.',
    status: 'pending_review',
    city: '深圳',
  },
  {
    id: 'interpreter_4',
    sortOrder: 4,
    name: '黄志远',
    language: 'English & Cantonese/Mandarin',
    focus: '商务贸易、制造业考察',
    focusEn: 'Business Trade, Manufacturing Inspection',
    helps: ['商务谈判', '工厂参观', '专业术语', '合同翻译'],
    helpsEn: ['Business negotiation', 'Factory visits', 'Technical terminology', 'Contract translation'],
    avatar: 'https://picsum.photos/200/200?random=4',
    bio: '前外贸公司高管，拥有15年国际贸易经验。熟悉广交会、制造业供应链，擅长商务场景下的专业口译。目前已暂停接单。',
    bioEn: 'Former foreign trade executive with 15 years of international trade experience. Familiar with Canton Fair and manufacturing supply chains, specializing in professional business interpretation. Currently not accepting bookings.',
    status: 'inactive',
    city: '广州',
  },
]

// ─── 预约 Mock ────────────────────────────────────
export const mockBookings: Booking[] = [
  {
    id: 'booking_1',
    name: 'Sarah Johnson',
    contact: 'sarah.j@email.com',
    city: '广州',
    date: '2026-05-25',
    mode: '全天陪同',
    groupSize: '3-5人',
    needs: '需要陪同参观广交会，并安排工厂考察。需要商务级别的翻译服务。',
    fastTrack: true,
    status: 'pending',
    assignedInterpreterId: null,
    assignedInterpreterName: null,
    createdAt: '2026-05-16T10:30:00Z',
  },
  {
    id: 'booking_2',
    name: 'Michael Chen',
    contact: '+1-555-0123',
    city: '潮州',
    date: '2026-05-22',
    mode: '半日陪同',
    groupSize: '1-2人',
    needs: '潮州美食之旅，想品尝最地道的潮州菜，参观传统手工艺作坊。',
    fastTrack: false,
    status: 'confirmed',
    assignedInterpreterId: 'interpreter_2',
    assignedInterpreterName: '林伟豪',
    createdAt: '2026-05-15T14:20:00Z',
  },
  {
    id: 'booking_3',
    name: 'Emma Williams',
    contact: 'emma.w@email.com',
    city: '广州',
    date: '2026-05-18',
    mode: '按小时陪同',
    groupSize: '1人',
    needs: '商务会议翻译，需要陪同参加在广州珠江新城的客户会议。',
    fastTrack: true,
    status: 'completed',
    assignedInterpreterId: 'interpreter_1',
    assignedInterpreterName: '陈晓琳',
    createdAt: '2026-05-14T09:00:00Z',
  },
  {
    id: 'booking_4',
    name: 'David Brown',
    contact: 'david.b@email.com',
    city: '深圳',
    date: '2026-05-30',
    mode: '全天陪同',
    groupSize: '5-8人',
    needs: '团队商务考察，需参观深圳科技园区并安排与当地企业交流。',
    fastTrack: false,
    status: 'pending',
    assignedInterpreterId: null,
    assignedInterpreterName: null,
    createdAt: '2026-05-16T16:45:00Z',
  },
  {
    id: 'booking_5',
    name: 'Lisa Park',
    contact: '+82-10-1234-5678',
    city: '湛江',
    date: '2026-05-20',
    mode: '半日陪同',
    groupSize: '2-3人',
    needs: '湛江滨海休闲，了解当地渔文化和海鲜美食。',
    fastTrack: false,
    status: 'cancelled',
    assignedInterpreterId: null,
    assignedInterpreterName: null,
    createdAt: '2026-05-13T11:00:00Z',
  },
]

// ─── FAQ Mock ─────────────────────────────────────
export const mockFAQs: FAQ[] = [
  {
    id: 'faq_1',
    sortOrder: 1,
    question: '如何预约口译服务？',
    questionEn: 'How do I book interpreting services?',
    answer: '您可以通过我们的网站填写预约表单，选择服务模式、日期和城市。提交后我们的团队会在24小时内与您确认。',
    answerEn: 'You can fill out the booking form on our website, selecting the service mode, date, and city. Our team will confirm with you within 24 hours of submission.',
    category: 'interpreting',
  },
  {
    id: 'faq_2',
    sortOrder: 2,
    question: '口译员是否具备专业资质？',
    questionEn: 'Are the interpreters professionally qualified?',
    answer: '我们的口译员均具有英语专业八级或同等水平，且经过严格的岭南文化知识培训。部分口译员还具备特定领域的专业背景（如考古、艺术、商务等）。',
    answerEn: 'All our interpreters hold TEM-8 or equivalent English proficiency and have undergone rigorous Lingnan cultural knowledge training. Some interpreters also have specialized backgrounds in fields such as archaeology, art, and business.',
    category: 'interpreting',
  },
  {
    id: 'faq_3',
    sortOrder: 3,
    question: '可以取消预约吗？退款政策是什么？',
    questionEn: 'Can I cancel a booking? What is the refund policy?',
    answer: '预约日期前48小时取消可全额退款，24-48小时内取消退还50%，24小时内取消不予退款。特殊情况请直接联系我们。',
    answerEn: 'Full refund for cancellations 48+ hours before the booking date, 50% refund for 24-48 hours, no refund within 24 hours. Please contact us directly for special circumstances.',
    category: 'general',
  },
  {
    id: 'faq_4',
    sortOrder: 4,
    question: '路线游览有季节性限制吗？',
    questionEn: 'Are there seasonal restrictions on route tours?',
    answer: '广东气候温暖，全年适合旅游。但部分活动（如赏花、节庆体验）有特定的最佳时节，我们会在路线详情中注明推荐月份。',
    answerEn: 'Guangdong has a warm climate suitable for year-round travel. However, certain activities (such as flower viewing and festival experiences) have specific optimal seasons, which we note in the route details.',
    category: 'routes',
  },
  {
    id: 'faq_5',
    sortOrder: 5,
    question: '是否支持团体预约？',
    questionEn: 'Do you support group bookings?',
    answer: '支持！我们提供1-8人的团体服务。超过8人的大型团体请联系我们定制方案，我们会根据人数和需求匹配合适的团队。',
    answerEn: 'Yes! We offer services for groups of 1-8 people. For larger groups exceeding 8, please contact us for a customized plan — we will match the appropriate team based on group size and needs.',
    category: 'interpreting',
  },
]
