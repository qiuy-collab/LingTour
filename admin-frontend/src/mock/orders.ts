// ============================================
// 订单 Mock 数据
// ============================================
import type { Order } from '@/types/order'

let _nextId = 1
export function generateId(): string {
  return `ord-${String(_nextId++).padStart(4, '0')}`
}

function daysAgo(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString()
}

const baseOrder = {
  guestEmail: null,
  paymentId: null,
  paidAt: null,
  paymentFailureReason: null,
  trackingNo: null,
  refundReason: null,
}

export const mockOrders: Order[] = [
  {
    ...baseOrder,
    id: 'ord-0300',
    orderNo: 'LT202605150001',
    userId: 'user-001',
    userName: 'Sarah Chen',
    userEmail: 'sarah.chen@example.com',
    items: [
      { productId: 'prod-0200', productName: '贝壳镶嵌首饰盒', productImage: 'https://picsum.photos/seed/seashell/200/200', quantity: 1, unitPrice: 32 },
      { productId: 'prod-0201', productName: '手工编织渔网袋', productImage: 'https://picsum.photos/seed/fishnet/200/200', quantity: 2, unitPrice: 18 },
    ],
    subtotal: 68, shipping: 5, tax: 5.17, total: 78.17, currency: 'SGD',
    shippingAddress: { fullName: 'Sarah Chen', phone: '+65 9123 4567', country: 'Singapore', city: 'Singapore', address: '123 Orchard Road, #12-34', postalCode: '238801' },
    contactEmail: 'sarah.chen@example.com',
    status: 'delivered',
    paymentStatus: 'paid',
    paymentMethod: 'Credit Card',
    paidAt: daysAgo(2),
    createdAt: daysAgo(2),
    updatedAt: daysAgo(1),
  },
  {
    ...baseOrder,
    id: 'ord-0301',
    orderNo: 'LT202605160002',
    userId: 'user-002',
    userName: 'Michael Tan',
    userEmail: 'michael.tan@example.com',
    items: [
      { productId: 'prod-0202', productName: '凤凰单丛蜜兰香', productImage: 'https://picsum.photos/seed/dancong/200/200', quantity: 2, unitPrice: 45 },
      { productId: 'prod-0203', productName: '潮州朱泥手拉壶', productImage: 'https://picsum.photos/seed/teapot/200/200', quantity: 1, unitPrice: 88 },
    ],
    subtotal: 178, shipping: 8, tax: 13.53, total: 199.53, currency: 'SGD',
    shippingAddress: { fullName: 'Michael Tan', phone: '+65 8234 5678', country: 'Singapore', city: 'Singapore', address: '456 Bukit Timah Road, #05-67', postalCode: '259712' },
    contactEmail: 'michael.tan@example.com',
    status: 'shipped',
    paymentStatus: 'paid',
    paymentMethod: 'PayPal',
    paidAt: daysAgo(1),
    createdAt: daysAgo(1),
    updatedAt: daysAgo(0),
  },
  {
    ...baseOrder,
    id: 'ord-0302',
    orderNo: 'LT202605170003',
    userId: 'user-003',
    userName: 'Emily Wong',
    userEmail: 'emily.wong@example.com',
    items: [
      { productId: 'prod-0204', productName: '满洲窗书签套装', productImage: 'https://picsum.photos/seed/bookmark/200/200', quantity: 3, unitPrice: 12 },
      { productId: 'prod-0205', productName: '客家蓝染围巾', productImage: 'https://picsum.photos/seed/indigo/200/200', quantity: 1, unitPrice: 28 },
    ],
    subtotal: 64, shipping: 5, tax: 4.86, total: 73.86, currency: 'SGD',
    shippingAddress: { fullName: 'Emily Wong', phone: '+65 9345 6789', country: 'Singapore', city: 'Singapore', address: '789 East Coast Road, #08-12', postalCode: '459012' },
    contactEmail: 'emily.wong@example.com',
    status: 'confirmed',
    paymentStatus: 'paid',
    paymentMethod: 'Credit Card',
    paidAt: daysAgo(0),
    createdAt: daysAgo(0),
    updatedAt: daysAgo(0),
  },
  {
    ...baseOrder,
    id: 'ord-0303',
    orderNo: 'LT202605170004',
    userId: 'user-004',
    userName: 'James Liu',
    userEmail: 'james.liu@example.com',
    items: [
      { productId: 'prod-0200', productName: '贝壳镶嵌首饰盒', productImage: 'https://picsum.photos/seed/seashell/200/200', quantity: 1, unitPrice: 32 },
      { productId: 'prod-0203', productName: '潮州朱泥手拉壶', productImage: 'https://picsum.photos/seed/teapot/200/200', quantity: 1, unitPrice: 88 },
      { productId: 'prod-0205', productName: '客家蓝染围巾', productImage: 'https://picsum.photos/seed/indigo/200/200', quantity: 1, unitPrice: 28 },
    ],
    subtotal: 148, shipping: 10, tax: 11.25, total: 169.25, currency: 'SGD',
    shippingAddress: { fullName: 'James Liu', phone: '+65 8456 7890', country: 'Singapore', city: 'Singapore', address: '321 River Valley Road, #15-20', postalCode: '238301' },
    contactEmail: 'james.liu@example.com',
    status: 'pending',
    paymentStatus: 'unpaid',
    paymentMethod: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    ...baseOrder,
    id: 'ord-0304',
    orderNo: 'LT202605100005',
    userId: 'user-005',
    userName: 'Linda Ng',
    userEmail: 'linda.ng@example.com',
    items: [
      { productId: 'prod-0201', productName: '手工编织渔网袋', productImage: 'https://picsum.photos/seed/fishnet/200/200', quantity: 1, unitPrice: 18 },
    ],
    subtotal: 18, shipping: 5, tax: 1.37, total: 24.37, currency: 'SGD',
    shippingAddress: { fullName: 'Linda Ng', phone: '+65 9567 8901', country: 'Singapore', city: 'Singapore', address: '567 Tampines Ave 5, #03-45', postalCode: '529567' },
    contactEmail: 'linda.ng@example.com',
    status: 'cancelled',
    paymentStatus: 'refunded',
    paymentMethod: 'Credit Card',
    refundReason: '客户要求取消订单',
    createdAt: daysAgo(7),
    updatedAt: daysAgo(6),
    notes: '客户要求取消订单',
  },
]
