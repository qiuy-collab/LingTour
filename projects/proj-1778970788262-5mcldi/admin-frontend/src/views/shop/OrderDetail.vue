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
      `确定将订单 ${order.value.orderNo} 标记为已发货？`,
      '确认发货',
      { type: 'info' }
    )
    await ordersApi.markShipped(order.value.id)
    order.value.status = 'shipped'
    ElMessage.success('已发货')
  } catch { /* 取消 */ }
}

async function handleRefund() {
  if (!order.value) return
  try {
    const { value: reason } = await ElMessageBox.prompt(
      '请输入退款原因',
      '确认退款',
      { inputPlaceholder: '退款原因（可选）' }
    )
    await ordersApi.markRefunded(order.value.id, reason || undefined)
    order.value.paymentStatus = 'refunded'
    ElMessage.success('已退款')
  } catch { /* 取消 */ }
}

async function handleCancel() {
  if (!order.value) return
  try {
    await ElMessageBox.confirm(
      `确定取消订单 ${order.value.orderNo}？`,
      '确认取消',
      { type: 'warning' }
    )
    await ordersApi.updateOrderStatus(order.value.id, 'cancelled')
    order.value.status = 'cancelled'
    ElMessage.success('订单已取消')
  } catch { /* 取消 */ }
}

function formatDate(d: string) {
  if (!d) return '-'
  return new Date(d).toLocaleString('zh-CN', {
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
      <h2>订单详情</h2>
      <el-button @click="goBack">← 返回列表</el-button>
    </div>

    <template v-if="order">
      <!-- 状态步骤条 -->
      <el-card shadow="never" class="status-card" v-if="order.status !== 'cancelled'">
        <el-steps :active="statusIndex" align-center finish-status="success">
          <el-step title="待确认" :description="order.status === 'pending' ? '等待确认' : ''" />
          <el-step title="已确认" :description="order.status === 'confirmed' ? '待发货' : ''" />
          <el-step title="已发货" :description="order.status === 'shipped' ? '运输中' : ''" />
          <el-step title="已签收" />
        </el-steps>
      </el-card>

      <!-- 已取消标记 -->
      <el-result
        v-if="order.status === 'cancelled'"
        icon="error"
        title="订单已取消"
        :sub-title="`订单号：${order.orderNo}`"
      />

      <!-- 基本信息 -->
      <el-card shadow="never" class="info-card">
        <template #header>
          <div class="card-header">
            <span>订单信息</span>
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
          <el-descriptions-item label="订单号">{{ order.orderNo }}</el-descriptions-item>
          <el-descriptions-item label="币种">{{ order.currency }}</el-descriptions-item>
          <el-descriptions-item label="用户">{{ order.userName }}</el-descriptions-item>
          <el-descriptions-item label="邮箱">{{ order.userEmail || order.guestEmail || '-' }}</el-descriptions-item>
          <el-descriptions-item label="支付方式">{{ order.paymentMethod || '-' }}</el-descriptions-item>
          <el-descriptions-item label="支付时间">{{ formatDate(order.paidAt || '') }}</el-descriptions-item>
          <el-descriptions-item label="下单时间">{{ formatDate(order.createdAt) }}</el-descriptions-item>
          <el-descriptions-item label="最后更新">{{ formatDate(order.updatedAt || '') }}</el-descriptions-item>
          <el-descriptions-item label="物流单号">{{ order.trackingNo || '-' }}</el-descriptions-item>
          <el-descriptions-item label="退款原因">{{ order.refundReason || '-' }}</el-descriptions-item>
          <el-descriptions-item label="备注">{{ order.notes || '-' }}</el-descriptions-item>
        </el-descriptions>
      </el-card>

      <!-- 商品明细 -->
      <el-card shadow="never" class="info-card">
        <template #header>
          <span>商品明细</span>
        </template>

        <el-table :data="order.items" stripe size="small">
          <el-table-column label="图片" width="80">
            <template #default="{ row: item }">
              <el-image
                v-if="item.productImage"
                :src="item.productImage"
                style="width: 50px; height: 50px; border-radius: 4px"
                fit="cover"
              />
            </template>
          </el-table-column>
          <el-table-column prop="productName" label="商品名称" min-width="200" />
          <el-table-column label="单价" width="120" align="right">
            <template #default="{ row: item }">
              {{ order.currency }} {{ item.unitPrice.toFixed(2) }}
            </template>
          </el-table-column>
          <el-table-column prop="quantity" label="数量" width="80" align="center" />
          <el-table-column label="小计" width="120" align="right">
            <template #default="{ row: item }">
              {{ order.currency }} {{ (item.unitPrice * item.quantity).toFixed(2) }}
            </template>
          </el-table-column>
        </el-table>

        <div class="total-bar">
          <div>小计：{{ order.currency }} {{ order.subtotal.toFixed(2) }}</div>
          <div>+ 运费：{{ order.currency }} {{ order.shipping.toFixed(2) }}</div>
          <div>+ 税费：{{ order.currency }} {{ order.tax.toFixed(2) }}</div>
          <div class="total-line">合计：{{ order.currency }} <strong>{{ order.total.toFixed(2) }}</strong></div>
        </div>
      </el-card>

      <!-- 收货地址 -->
      <el-card shadow="never" class="info-card">
        <template #header>
          <span>收货地址</span>
        </template>

        <el-descriptions :column="2" border>
          <el-descriptions-item label="收货人">{{ order.shippingAddress.fullName }}</el-descriptions-item>
          <el-descriptions-item label="电话">{{ order.shippingAddress.phone }}</el-descriptions-item>
          <el-descriptions-item label="国家">{{ order.shippingAddress.country }}</el-descriptions-item>
          <el-descriptions-item label="城市">{{ order.shippingAddress.city }}</el-descriptions-item>
          <el-descriptions-item label="详细地址" :span="2">{{ order.shippingAddress.address }}</el-descriptions-item>
          <el-descriptions-item label="邮编">{{ order.shippingAddress.postalCode }}</el-descriptions-item>
          <el-descriptions-item label="联系邮箱">{{ order.contactEmail }}</el-descriptions-item>
        </el-descriptions>
      </el-card>

      <!-- 操作按钮 -->
      <div class="action-bar">
        <template v-if="order.status === 'pending'">
          <el-button type="danger" @click="handleCancel">取消订单</el-button>
        </template>
        <template v-if="order.status === 'confirmed' && order.paymentStatus === 'paid'">
          <el-button type="success" @click="handleShip">确认发货</el-button>
        </template>
        <template v-if="order.paymentStatus === 'paid' && order.status !== 'cancelled'">
          <el-button type="warning" @click="handleRefund">退款</el-button>
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
  background: #f5f7fa;
  border-radius: 8px;
  display: flex;
  gap: 12px;
}
</style>
