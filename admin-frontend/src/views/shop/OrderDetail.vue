<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ordersApi } from '@/api/orders'
import { OrderStatusMap, OrderStatusColorMap, PaymentStatusMap, PaymentStatusColorMap } from '@/types/order'
import type { Order, OrderStatus } from '@/types/order'

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const order = ref<Order | null>(null)

const statusSteps = ['pending', 'confirmed', 'shipped', 'delivered'] as OrderStatus[]
const statusIndex = computed(() => {
  if (!order.value) return -1
  const s = order.value.status
  if (s === 'cancelled') return -1
  return statusSteps.indexOf(s)
})

async function fetchDetail() {
  loading.value = true
  try {
    const id = route.params.id as string
    const res = await ordersApi.getOrder(id)
    order.value = res.data.data
  } finally {
    loading.value = false
  }
}

function goBack() {
  router.push('/admin/orders')
}

async function handleShip() {
  if (!order.value) return
  try {
    await ElMessageBox.confirm(
      `Mark order ${order.value.orderNo} as shipped?`,
      'Confirm shipment',
      { type: 'info' }
    )
    await ordersApi.markShipped(order.value.id)
    order.value.status = 'shipped'
    ElMessage.success('Order marked as shipped')
  } catch { /* cancelled */ }
}

async function handleRefund() {
  if (!order.value) return
  try {
    const { value: reason } = await ElMessageBox.prompt(
      'Enter a refund reason',
      'Confirm refund',
      { inputPlaceholder: 'Refund reason (optional)' }
    )
    await ordersApi.markRefunded(order.value.id, reason || undefined)
    order.value.paymentStatus = 'refunded'
    ElMessage.success('Refund issued')
  } catch { /* cancelled */ }
}

async function handleCancel() {
  if (!order.value) return
  try {
    await ElMessageBox.confirm(
      `Cancel order ${order.value.orderNo}?`,
      'Confirm cancellation',
      { type: 'warning' }
    )
    await ordersApi.updateOrderStatus(order.value.id, 'cancelled')
    order.value.status = 'cancelled'
    ElMessage.success('Order cancelled')
  } catch { /* cancelled */ }
}

function formatDate(d: string) {
  if (!d || (typeof d === 'object' && Object.keys(d as any).length === 0)) return '-'
  const date = new Date(d)
  if (isNaN(date.getTime())) return '-'
  return date.toLocaleString('en-GB', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

onMounted(() => {
  fetchDetail()
})
</script>

<template>
  <div class="page-container" v-loading="loading">
    <div class="page-header">
      <h2>Order details</h2>
      <el-button @click="goBack">← Back to orders</el-button>
    </div>

    <template v-if="order">
      <!-- 状态步骤条 -->
      <el-card shadow="never" class="status-card" v-if="order.status !== 'cancelled'">
        <el-steps :active="statusIndex" align-center finish-status="success">
          <el-step title="Pending" :description="order.status === 'pending' ? 'Awaiting confirmation' : ''" />
          <el-step title="Confirmed" :description="order.status === 'confirmed' ? 'Awaiting shipment' : ''" />
          <el-step title="Shipped" :description="order.status === 'shipped' ? 'In transit' : ''" />
          <el-step title="Delivered" />
        </el-steps>
      </el-card>

      <!-- 已取消标记 -->
      <el-result
        v-if="order.status === 'cancelled'"
        icon="error"
        title="Order cancelled"
        :sub-title="`Order: ${order.orderNo}`"
      />

      <!-- 基本信息 -->
      <el-card shadow="never" class="info-card">
        <template #header>
          <div class="card-header">
            <span>Order information</span>
            <div style="display: flex; gap: 8px">
              <el-tag :type="OrderStatusColorMap[order.status] as any" size="default">
                {{ OrderStatusMap[order.status] }}
              </el-tag>
              <el-tag :type="PaymentStatusColorMap[order.paymentStatus] as any" size="default">
                {{ PaymentStatusMap[order.paymentStatus] }}
              </el-tag>
            </div>
          </div>
        </template>

        <el-descriptions :column="2" border>
          <el-descriptions-item label="Order">{{ order.orderNo }}</el-descriptions-item>
          <el-descriptions-item label="Currency">{{ order.currency }}</el-descriptions-item>
          <el-descriptions-item label="Customer">{{ order.userName }}</el-descriptions-item>
          <el-descriptions-item label="Email">{{ order.userEmail || order.guestEmail || '-' }}</el-descriptions-item>
          <el-descriptions-item label="Payment method">{{ order.paymentMethod || '-' }}</el-descriptions-item>
          <el-descriptions-item label="Paid">{{ formatDate(order.paidAt || '') }}</el-descriptions-item>
          <el-descriptions-item label="Placed">{{ formatDate(order.createdAt) }}</el-descriptions-item>
          <el-descriptions-item label="Last updated">{{ formatDate(order.updatedAt || '') }}</el-descriptions-item>
          <el-descriptions-item label="Tracking number">{{ order.trackingNo || '-' }}</el-descriptions-item>
          <el-descriptions-item label="Refund reason">{{ order.refundReason || '-' }}</el-descriptions-item>
          <el-descriptions-item label="Notes">{{ order.notes || '-' }}</el-descriptions-item>
        </el-descriptions>
      </el-card>

      <!-- 商品明细 -->
      <el-card shadow="never" class="info-card">
        <template #header>
            <span>Items</span>
        </template>

        <el-table :data="order.items" stripe size="small">
          <el-table-column label="Image" width="80">
            <template #default="{ row: item }">
              <el-image
                v-if="item.productImage"
                :src="item.productImage"
                style="width: 50px; height: 50px; border-radius: 4px"
                fit="cover"
              />
            </template>
          </el-table-column>
          <el-table-column prop="productName" label="Product" min-width="200" />
          <el-table-column label="Unit price" width="120" align="right">
            <template #default="{ row: item }">
              {{ order.currency }} {{ item.unitPrice.toFixed(2) }}
            </template>
          </el-table-column>
          <el-table-column prop="quantity" label="Quantity" width="80" align="center" />
          <el-table-column label="Subtotal" width="120" align="right">
            <template #default="{ row: item }">
              {{ order.currency }} {{ (item.unitPrice * item.quantity).toFixed(2) }}
            </template>
          </el-table-column>
        </el-table>

        <div class="total-bar">
          <div>Subtotal: {{ order.currency }} {{ order.subtotal.toFixed(2) }}</div>
          <div>+ Shipping: {{ order.currency }} {{ order.shipping.toFixed(2) }}</div>
          <div>+ Tax: {{ order.currency }} {{ order.tax.toFixed(2) }}</div>
          <div class="total-line">Total: {{ order.currency }} <strong>{{ order.total.toFixed(2) }}</strong></div>
        </div>
      </el-card>

      <!-- 收货地址 -->
      <el-card shadow="never" class="info-card">
        <template #header>
            <span>Shipping address</span>
        </template>

        <el-descriptions :column="2" border>
          <el-descriptions-item label="Recipient">{{ order.shippingAddress.fullName }}</el-descriptions-item>
          <el-descriptions-item label="Phone">{{ order.shippingAddress.phone }}</el-descriptions-item>
          <el-descriptions-item label="Country">{{ order.shippingAddress.country }}</el-descriptions-item>
          <el-descriptions-item label="City">{{ order.shippingAddress.city }}</el-descriptions-item>
          <el-descriptions-item label="Address" :span="2">{{ order.shippingAddress.address }}</el-descriptions-item>
          <el-descriptions-item label="Postal code">{{ order.shippingAddress.postalCode }}</el-descriptions-item>
          <el-descriptions-item label="Contact email">{{ order.contactEmail }}</el-descriptions-item>
        </el-descriptions>
      </el-card>

      <!-- 操作按钮 -->
      <div class="action-bar">
        <template v-if="order.status === 'pending'">
          <el-button type="danger" @click="handleCancel">Cancel order</el-button>
        </template>
        <template v-if="order.status === 'confirmed' && order.paymentStatus === 'paid'">
          <el-button type="success" @click="handleShip">Confirm shipment</el-button>
        </template>
        <template v-if="order.paymentStatus === 'paid' && order.status !== 'cancelled'">
          <el-button type="warning" @click="handleRefund">Refund</el-button>
        </template>
      </div>
    </template>
  </div>
</template>

<style scoped>
.page-container { padding: 20px; max-width: 1000px; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.page-header h2 { margin: 0; font-size: 20px; }

.status-card { margin-bottom: 16px; }

.info-card { margin-bottom: 16px; }
.card-header { display: flex; justify-content: space-between; align-items: center; }

.total-bar {
  margin-top: 16px;
  text-align: right;
  line-height: 1.8;
}
.total-line {
  font-size: 16px;
  padding-top: 8px;
  border-top: 1px solid #ebeef5;
}
.total-line strong {
  color: #f56c6c;
  font-size: 18px;
}

.action-bar {
  margin-top: 20px;
  padding: 16px;
  background: var(--lt-bg-card, #f5f7fa);
  border-radius: 8px;
  display: flex;
  gap: 12px;
}
</style>
