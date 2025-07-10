<template>
	<view class="container">
		<!-- Tab切换栏 -->
		<view class="tab-container">
			<view class="tab-item" :class="{ active: currentTab === 0 }" @click="switchTab(0)">
				<text class="tab-text">全部</text>
				<view class="tab-badge" v-if="allOrdersCount > 0">
					<text class="badge-text">{{ allOrdersCount }}</text>
				</view>
			</view>
			<view class="tab-item" :class="{ active: currentTab === 1 }" @click="switchTab(1)">
				<text class="tab-text">待付款</text>
				<view class="tab-badge" v-if="pendingOrdersCount > 0">
					<text class="badge-text">{{ pendingOrdersCount }}</text>
				</view>
			</view>
			<view class="tab-item" :class="{ active: currentTab === 2 }" @click="switchTab(2)">
				<text class="tab-text">待消费</text>
				<view class="tab-badge" v-if="consumptionOrdersCount > 0">
					<text class="badge-text">{{ consumptionOrdersCount }}</text>
				</view>
			</view>
			<view class="tab-item" :class="{ active: currentTab === 3 }" @click="switchTab(3)">
				<text class="tab-text">评价</text>
				<view class="tab-badge" v-if="reviewOrdersCount > 0">
					<text class="badge-text">{{ reviewOrdersCount }}</text>
				</view>
			</view>
			<!-- 滑动指示条 -->
			<view class="tab-indicator" :style="{ left: indicatorPosition }"></view>
		</view>

		<!-- 订单内容区域 -->
		<scroll-view scroll-y="true" class="order-content">
			<!-- 全部订单 -->
			<view v-if="currentTab === 0" class="order-list">
				<view v-if="allOrders.length === 0" class="empty-state">
					<image src="/static/images/OwO_logo.png" class="empty-icon"></image>
					<text class="empty-text">暂无订单</text>
				</view>
				<view v-else>
					<view class="order-item" v-for="order in currentAllOrders" :key="order.card_id">
						<view class="order-header">
							<view class="order-header-left">
								<text class="order-number">订单号：{{ order.card_id }}</text>
								<text class="order-time">{{ formatTime(order.payTime) }}</text>
							</view>
							<text class="order-status" :class="getStatusClass(order.status)">{{ getStatusText(order.status) }}</text>
						</view>
						<view class="order-body">
							<image :src="order.img" class="order-image" mode="aspectFill"></image>
							<view class="order-info">
								<text class="order-name">{{ order.name }}</text>
								<view class="order-detail">
									<text class="detail-label">预定时间：</text>
									<text class="detail-value">{{ formatScheduledTime(order.scheduledTime) }}</text>
								</view>
								<view class="order-detail" v-if="order.model">
									<text class="detail-label">规格：</text>
									<text class="detail-value">{{ formatModel(order.model) }}</text>
								</view>
							</view>
							<view class="order-price-section">
								<view class="quantity-above-price">
									<text class="order-quantity">共{{ order.count }}件</text>
								</view>
								<text class="order-price">￥{{ calculateOrderTotal(order) }}</text>
							</view>
						</view>
						<view class="order-actions">
							<!-- 待付款订单操作按钮 -->
							<template v-if="order.status === 0">
								<button class="action-btn cancel-btn" @click="cancelOrder(order.card_id)">取消订单</button>
								<button class="action-btn pay-btn" @click="payOrder(order.card_id)">立即付款</button>
							</template>

							<!-- 待消费订单操作按钮 -->
							<template v-if="order.status === 1">
								<button class="action-btn cancel-btn" @click="cancelOrder(order.card_id)">取消订单</button>
								<button class="action-btn confirm-btn" @click="confirmConsumption(order.card_id)">确认消费</button>
							</template>

							<!-- 已完成订单操作按钮 -->
							<template v-if="order.status === 2">
								<button class="action-btn review-btn" @click="writeReview(order.card_id)">写评价</button>
								<button class="action-btn delete-btn" @click="cancelOrder(order.card_id)">删除订单</button>
								<button class="action-btn rebuy-btn" @click="buyAgain(order.card_id)">再次购买</button>
							</template>
						</view>
					</view>
				</view>

				<!-- 分页组件 -->
				<view v-if="allOrders.length > pageSize" class="pagination">
					<view class="pagination-controls">
						<button class="page-nav-btn" :disabled="allCurrentPage === 1" @click="changeAllPage(allCurrentPage - 1)">
							<text class="nav-icon">‹</text>
						</button>
						<button v-for="page in getAllPageNumbers" :key="page" class="page-number-btn"
							:class="{ active: page === allCurrentPage }" @click="changeAllPage(page)">
							{{ page }}
						</button>
						<button class="page-nav-btn" :disabled="allCurrentPage === allTotalPages"
							@click="changeAllPage(allCurrentPage + 1)">
							<text class="nav-icon">›</text>
						</button>
					</view>
				</view>
			</view>

			<!-- 待付款订单 -->
			<view v-if="currentTab === 1" class="order-list">
				<view v-if="pendingOrders.length === 0" class="empty-state">
					<image src="/static/images/OwO_logo.png" class="empty-icon"></image>
					<text class="empty-text">暂无待付款订单</text>
				</view>
				<view v-else>
					<view class="order-item" v-for="order in currentPendingOrders" :key="order.card_id">
						<view class="order-header">
							<view class="order-header-left">
								<text class="order-number">订单号：{{ order.card_id }}</text>
								<text class="order-time">{{ formatTime(order.payTime) }}</text>
							</view>
							<text class="order-status pending">待付款</text>
						</view>
						<view class="order-body">
							<image :src="order.img" class="order-image" mode="aspectFill"></image>
							<view class="order-info">
								<text class="order-name">{{ order.name }}</text>
								<view class="order-detail">
									<text class="detail-label">预定时间：</text>
									<text class="detail-value">{{ formatScheduledTime(order.scheduledTime) }}</text>
								</view>
								<view class="order-detail" v-if="order.model">
									<text class="detail-label">规格：</text>
									<text class="detail-value">{{ formatModel(order.model) }}</text>
								</view>
							</view>
							<view class="order-price-section">
								<view class="quantity-above-price">
									<text class="order-quantity">共{{ order.count }}件</text>
								</view>
								<text class="order-price">￥{{ calculateOrderTotal(order) }}</text>
							</view>
						</view>
						<view class="order-actions">
							<button class="action-btn cancel-btn" @click="cancelOrder(order.card_id)">取消订单</button>
							<button class="action-btn pay-btn" @click="payOrder(order.card_id)">立即付款</button>
						</view>
					</view>
					<!-- 分页组件 -->
					<view v-if="pendingOrders.length > pageSize" class="pagination">
						<view class="pagination-controls">
							<button class="page-nav-btn" :disabled="pendingCurrentPage === 1"
								@click="changePendingPage(pendingCurrentPage - 1)">
								<text class="nav-icon">‹</text>
							</button>
							<button v-for="page in getPendingPageNumbers" :key="page" class="page-number-btn"
								:class="{ active: page === pendingCurrentPage }" @click="changePendingPage(page)">
								{{ page }}
							</button>
							<button class="page-nav-btn" :disabled="pendingCurrentPage === pendingTotalPages"
								@click="changePendingPage(pendingCurrentPage + 1)">
								<text class="nav-icon">›</text>
							</button>
						</view>
					</view>
				</view>
			</view>

			<!-- 待消费订单 -->
			<view v-if="currentTab === 2" class="order-list">
				<view v-if="consumptionOrders.length === 0" class="empty-state">
					<image src="/static/images/OwO_logo.png" class="empty-icon"></image>
					<text class="empty-text">暂无待消费订单</text>
				</view>
				<view v-else>
					<view class="order-item" v-for="order in currentConsumptionOrders" :key="order.card_id">
						<view class="order-header">
							<view class="order-header-left">
								<text class="order-number">订单号：{{ order.card_id }}</text>
								<text class="order-time">{{ formatTime(order.payTime) }}</text>
							</view>
							<text class="order-status consumption">待消费</text>
						</view>
						<view class="order-body">
							<image :src="order.img" class="order-image" mode="aspectFill"></image>
							<view class="order-info">
								<text class="order-name">{{ order.name }}</text>
								<view class="order-detail">
									<text class="detail-label">预定时间：</text>
									<text class="detail-value">{{ formatScheduledTime(order.scheduledTime) }}</text>
								</view>
								<view class="order-detail" v-if="order.model">
									<text class="detail-label">规格：</text>
									<text class="detail-value">{{ formatModel(order.model) }}</text>
								</view>
							</view>
							<view class="order-price-section">
								<view class="quantity-above-price">
									<text class="order-quantity">共{{ order.count }}件</text>
								</view>
								<text class="order-price">￥{{ calculateOrderTotal(order) }}</text>
							</view>
						</view>
						<view class="order-actions">
							<button class="action-btn cancel-btn" @click="cancelOrder(order.card_id)">取消订单</button>
							<button class="action-btn confirm-btn" @click="confirmConsumption(order.card_id)">确认消费</button>
						</view>
					</view>
					<!-- 分页组件 -->
					<view v-if="consumptionOrders.length > pageSize" class="pagination">
						<view class="pagination-controls">
							<button class="page-nav-btn" :disabled="consumptionCurrentPage === 1"
								@click="changeConsumptionPage(consumptionCurrentPage - 1)">
								<text class="nav-icon">‹</text>
							</button>
							<button v-for="page in getConsumptionPageNumbers" :key="page" class="page-number-btn"
								:class="{ active: page === consumptionCurrentPage }" @click="changeConsumptionPage(page)">
								{{ page }}
							</button>
							<button class="page-nav-btn" :disabled="consumptionCurrentPage === consumptionTotalPages"
								@click="changeConsumptionPage(consumptionCurrentPage + 1)">
								<text class="nav-icon">›</text>
							</button>
						</view>
					</view>
				</view>
			</view>

			<!-- 评价订单 -->
			<view v-if="currentTab === 3" class="order-list">
				<view v-if="reviewOrders.length === 0" class="empty-state">
					<image src="/static/images/OwO_logo.png" class="empty-icon"></image>
					<text class="empty-text">暂无待评价订单</text>
				</view>
				<view v-else>
					<view class="order-item" v-for="order in currentReviewOrders" :key="order.card_id">
						<view class="order-header">
							<view class="order-header-left">
								<text class="order-number">订单号：{{ order.card_id }}</text>
								<text class="order-time">{{ formatTime(order.payTime) }}</text>
							</view>
							<text class="order-status completed">已完成</text>
						</view>
						<view class="order-body">
							<image :src="order.img" class="order-image" mode="aspectFill"></image>
							<view class="order-info">
								<text class="order-name">{{ order.name }}</text>
								<view class="order-detail">
									<text class="detail-label">预定时间：</text>
									<text class="detail-value">{{ formatScheduledTime(order.scheduledTime) }}</text>
								</view>
								<view class="order-detail" v-if="order.model">
									<text class="detail-label">规格：</text>
									<text class="detail-value">{{ formatModel(order.model) }}</text>
								</view>
							</view>
							<view class="order-price-section">
								<view class="quantity-above-price">
									<text class="order-quantity">共{{ order.count }}件</text>
								</view>
								<text class="order-price">￥{{ calculateOrderTotal(order) }}</text>
							</view>
						</view>
						<view class="order-actions">
							<button class="action-btn review-btn" @click="writeReview(order.card_id)">写评价</button>
							<button class="action-btn delete-btn" @click="cancelOrder(order.card_id)">删除订单</button>
							<button class="action-btn rebuy-btn" @click="buyAgain(order.card_id)">再次购买</button>
						</view>
					</view>
					<!-- 分页组件 -->
					<view v-if="reviewOrders.length > pageSize" class="pagination">
						<view class="pagination-controls">
							<button class="page-nav-btn" :disabled="reviewCurrentPage === 1"
								@click="changeReviewPage(reviewCurrentPage - 1)">
								<text class="nav-icon">‹</text>
							</button>
							<button v-for="page in getReviewPageNumbers" :key="page" class="page-number-btn"
								:class="{ active: page === reviewCurrentPage }" @click="changeReviewPage(page)">
								{{ page }}
							</button>
							<button class="page-nav-btn" :disabled="reviewCurrentPage === reviewTotalPages"
								@click="changeReviewPage(reviewCurrentPage + 1)">
								<text class="nav-icon">›</text>
							</button>
						</view>
					</view>
				</view>
			</view>
		</scroll-view>

		<!-- 加载状态 -->
		<view v-if="loading" class="loading-state">
			<text class="loading-text">加载中...</text>
		</view>
	</view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { onShow, onLoad } from '@dcloudio/uni-app'
import orderService from '../../utils/orderUtils.js'

// 响应式数据
const currentTab = ref(0)
const loading = ref(false)
const allOrders = ref([])

// 分页相关数据
const pageSize = 5
const allCurrentPage = ref(1)
const pendingCurrentPage = ref(1)
const consumptionCurrentPage = ref(1)
const reviewCurrentPage = ref(1)

// 计算属性 - 根据status过滤订单
const pendingOrders = computed(() => {
	return allOrders.value.filter(order => order.status === 0)
})

const consumptionOrders = computed(() => {
	return allOrders.value.filter(order => order.status === 1)
})

const reviewOrders = computed(() => {
	return allOrders.value.filter(order => order.status === 2)
})

// 计算属性 - 订单数量（用于角标）
const allOrdersCount = computed(() => {
	return allOrders.value.length
})

const pendingOrdersCount = computed(() => {
	return pendingOrders.value.length
})

const consumptionOrdersCount = computed(() => {
	return consumptionOrders.value.length
})

const reviewOrdersCount = computed(() => {
	return reviewOrders.value.length
})

// 分页计算属性
const allTotalPages = computed(() => {
	return Math.ceil(allOrders.value.length / pageSize)
})

const pendingTotalPages = computed(() => {
	return Math.ceil(pendingOrders.value.length / pageSize)
})

const consumptionTotalPages = computed(() => {
	return Math.ceil(consumptionOrders.value.length / pageSize)
})

const reviewTotalPages = computed(() => {
	return Math.ceil(reviewOrders.value.length / pageSize)
})

// 当前页数据
const currentAllOrders = computed(() => {
	const start = (allCurrentPage.value - 1) * pageSize
	const end = start + pageSize
	return allOrders.value.slice(start, end)
})

const currentPendingOrders = computed(() => {
	const start = (pendingCurrentPage.value - 1) * pageSize
	const end = start + pageSize
	return pendingOrders.value.slice(start, end)
})

const currentConsumptionOrders = computed(() => {
	const start = (consumptionCurrentPage.value - 1) * pageSize
	const end = start + pageSize
	return consumptionOrders.value.slice(start, end)
})

const currentReviewOrders = computed(() => {
	const start = (reviewCurrentPage.value - 1) * pageSize
	const end = start + pageSize
	return reviewOrders.value.slice(start, end)
})

// 计算指示条位置
const indicatorPosition = computed(() => {
	return `${currentTab.value * 25}%`
})

// 生成页码数组的计算属性
const getAllPageNumbers = computed(() => {
	return generatePageNumbers(allCurrentPage.value, allTotalPages.value)
})

const getPendingPageNumbers = computed(() => {
	return generatePageNumbers(pendingCurrentPage.value, pendingTotalPages.value)
})

const getConsumptionPageNumbers = computed(() => {
	return generatePageNumbers(consumptionCurrentPage.value, consumptionTotalPages.value)
})

const getReviewPageNumbers = computed(() => {
	return generatePageNumbers(reviewCurrentPage.value, reviewTotalPages.value)
})

// 生成页码数组的辅助函数
function generatePageNumbers(currentPage, totalPages) {
	const pages = []
	const maxVisible = 5 // 最多显示5个页码按钮

	if (totalPages <= maxVisible) {
		// 如果总页数不超过最大显示数，显示所有页码
		for (let i = 1; i <= totalPages; i++) {
			pages.push(i)
		}
	} else {
		// 如果总页数超过最大显示数，智能显示页码
		let start = Math.max(1, currentPage - Math.floor(maxVisible / 2))
		let end = Math.min(totalPages, start + maxVisible - 1)

		// 调整起始位置，确保显示足够的页码
		if (end - start + 1 < maxVisible) {
			start = Math.max(1, end - maxVisible + 1)
		}

		for (let i = start; i <= end; i++) {
			pages.push(i)
		}
	}

	return pages
}

// 获取当前用户
function getCurrentUser() {
	try {
		const token = uni.getStorageSync('token')
		if (!token || token.trim() === '') {
			return null
		}

		const currentUserStr = uni.getStorageSync('currentUser')
		if (!currentUserStr) {
			return null
		}

		return JSON.parse(currentUserStr)
	} catch (error) {
		console.error('获取当前用户失败:', error)
		return null
	}
}

// 加载订单数据
async function loadOrders() {
	const currentUser = getCurrentUser()
	if (!currentUser) {
		uni.showModal({
			title: '提示',
			content: '请先登录',
			showCancel: false,
			confirmText: '确定',
			success: () => {
				uni.navigateBack()
			}
		})
		return
	}

	loading.value = true
	try {
		const orders = await orderService.getUserOrders(currentUser.account)
		// 将嵌套的订单结构扁平化为订单项数组
		const flatOrders = []
		orders.forEach(order => {
			if (order.items && Array.isArray(order.items)) {
				flatOrders.push(...order.items)
			}
		})
		allOrders.value = flatOrders

	} catch (error) {
		console.error('加载订单失败:', error)
		uni.showToast({
			title: '加载订单失败',
			icon: 'none'
		})
	} finally {
		loading.value = false
	}
}

// 切换Tab
function switchTab(index) {
	currentTab.value = index
}

// 分页切换方法
function changeAllPage(page) {
	if (page >= 1 && page <= allTotalPages.value) {
		allCurrentPage.value = page
	}
}

function changePendingPage(page) {
	if (page >= 1 && page <= pendingTotalPages.value) {
		pendingCurrentPage.value = page
	}
}

function changeConsumptionPage(page) {
	if (page >= 1 && page <= consumptionTotalPages.value) {
		consumptionCurrentPage.value = page
	}
}

function changeReviewPage(page) {
	if (page >= 1 && page <= reviewTotalPages.value) {
		reviewCurrentPage.value = page
	}
}

// 格式化时间
function formatTime(timeStr) {
	if (!timeStr) return ''
	const date = new Date(timeStr)
	return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

// 格式化预定时间（年-月-日 时:分格式）
function formatScheduledTime(timeStr) {
	if (!timeStr) return ''
	// 如果是日期字符串，直接处理
	if (typeof timeStr === 'string') {
		// 如果已经是YYYY-MM-DD格式，添加时间部分
		if (timeStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
			return `${timeStr} 09:00`
		}
		// 如果包含时间，转换格式
		const date = new Date(timeStr)
		if (!isNaN(date.getTime())) {
			return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
		}
	}
	return timeStr
}

// 格式化商品规格
function formatModel(model) {
	if (!model) return ''
	if (typeof model === 'string') return model
	if (typeof model === 'object') {
		const parts = []
		if (model.size) parts.push(`尺寸: ${model.size}`)
		if (model.color) parts.push(`颜色: ${model.color}`)
		return parts.join(', ')
	}
	return ''
}

// 计算订单总金额
function calculateOrderTotal(order) {
	if (!order || !order.price || !order.count) return '0.00'
	const price = parseFloat(order.price)
	const count = parseInt(order.count)
	const total = price * count
	return total.toFixed(2)
}

// 获取订单状态样式类
function getStatusClass(status) {
	switch (status) {
		case 0:
			return 'pending'
		case 1:
			return 'consumption'
		case 2:
			return 'completed'
		default:
			return ''
	}
}

// 获取订单状态文本
function getStatusText(status) {
	switch (status) {
		case 0:
			return '待付款'
		case 1:
			return '待消费'
		case 2:
			return '已完成'
		default:
			return '未知状态'
	}
}

// 订单操作方法
async function cancelOrder(cardId) {
	uni.showModal({
		title: '确认取消',
		content: '确定要取消这个订单吗？',
		success: async (res) => {
			if (res.confirm) {
				try {
					await orderService.deleteOrderItem(cardId)
					uni.showToast({
						title: '订单已取消',
						icon: 'success'
					})
					await loadOrders() // 重新加载订单
				} catch (error) {
					console.error('取消订单失败:', error)
					uni.showToast({
						title: '取消失败',
						icon: 'none'
					})
				}
			}
		}
	})
}

async function payOrder(cardId) {
	try {
		// 查找对应的订单项
		const orderItem = pendingOrders.value.find(order => order.card_id === cardId)
		if (!orderItem) {
			uni.showToast({
				title: '订单项不存在',
				icon: 'none'
			})
			return
		}

		// 准备支付页面数据，参考购物车结算功能
		const orderData = {
			items: [{
				card_id: orderItem.card_id,
				name: orderItem.name,
				img: orderItem.img,
				count: orderItem.count,
				scheduledTime: orderItem.scheduledTime,
				model: orderItem.model,
				price: orderItem.price,
				status: 0 // 待付款状态
			}],
			totalPrice: (parseFloat(orderItem.price) * parseInt(orderItem.count)).toFixed(2),
			totalCount: parseInt(orderItem.count),
			orderId: orderItem.card_id // 使用card_id作为订单ID
		}

		// 将数据存储到本地，供支付页面使用
		uni.setStorageSync('checkoutData', JSON.stringify(orderData))

		// 跳转到支付页面
		uni.navigateTo({
			url: '/pages/PaymentPage/PaymentPage'
		})

	} catch (error) {
		console.error('立即付款失败:', error)
		uni.showToast({
			title: '跳转支付页面失败',
			icon: 'none'
		})
	}
}

async function confirmConsumption(cardId) {
	uni.showModal({
		title: '确认消费',
		content: '确定要标记此订单为已完成吗？',
		success: async (res) => {
			if (res.confirm) {
				try {
					uni.showLoading({
						title: '处理中...'
					})

					// 调用orderUtils.js的修改订单状态功能，修改状态为2（已完成）
					await orderService.updateOrderStatus(cardId, 2)

					uni.hideLoading()
					uni.showToast({
						title: '订单已完成',
						icon: 'success'
					})

					// 重新加载订单数据
					await loadOrders()

				} catch (error) {
					uni.hideLoading()
					console.error('确认消费失败:', error)
					uni.showToast({
						title: '操作失败，请重试',
						icon: 'none'
					})
				}
			}
		}
	})
}

async function writeReview(cardId) {
	uni.showToast({
		title: '评价功能开发中',
		icon: 'none'
	})
}

async function buyAgain(cardId) {
	try {
		// 查找对应的订单项
		const orderItem = reviewOrders.value.find(order => order.card_id === cardId)
		if (!orderItem) {
			uni.showToast({
				title: '订单项不存在',
				icon: 'none'
			})
			return
		}

		// 准备支付页面数据，参考购物车结算功能和立即付款功能
		const orderData = {
			items: [{
				card_id: Date.now().toString() + Math.random().toString(36).substring(2, 11), // 生成新的card_id
				name: orderItem.name,
				img: orderItem.img,
				count: orderItem.count,
				scheduledTime: new Date().toISOString().split('T')[0], // 使用当前日期
				model: orderItem.model,
				price: orderItem.price,
				status: 0 // 待付款状态
			}],
			totalPrice: (parseFloat(orderItem.price) * parseInt(orderItem.count)).toFixed(2),
			totalCount: parseInt(orderItem.count),
			orderId: Date.now().toString() // 生成新的订单ID
		}

		// 将数据存储到本地，供支付页面使用
		uni.setStorageSync('checkoutData', JSON.stringify(orderData))

		// 跳转到支付页面
		uni.navigateTo({
			url: '/pages/PaymentPage/PaymentPage'
		})

	} catch (error) {
		console.error('再次购买失败:', error)
		uni.showToast({
			title: '跳转支付页面失败',
			icon: 'none'
		})
	}
}

// 页面加载时接收参数
onLoad((options) => {
	if (options.tab !== undefined) {
		if (options.tab === 'all') {
			currentTab.value = 0 // 全部订单
		} else {
			const tabIndex = parseInt(options.tab) || 0
			// 由于添加了"全部"tab，需要调整索引：
			// 原来的 0(待付款) -> 现在的 1
			// 原来的 1(待消费) -> 现在的 2
			// 原来的 2(评价) -> 现在的 3
			// 新增的 "全部" -> 0
			if (tabIndex === 0) {
				currentTab.value = 1 // 待付款
			} else if (tabIndex === 1) {
				currentTab.value = 2 // 待消费
			} else if (tabIndex === 2) {
				currentTab.value = 3 // 评价
			} else {
				currentTab.value = 0 // 默认显示全部
			}
		}
	}
})

// 页面显示时加载数据
onShow(() => {
	loadOrders()
})

// 页面挂载时初始化
onMounted(() => {
	loadOrders()
})
</script>

<style scoped>
page {
	background-color: #f5f5f5;
}

.container {
	background-color: #f5f5f5;
}

/* Tab切换栏样式 */
.tab-container {
	position: relative;
	display: flex;
	background-color: #fff;
	border-bottom: 1px solid #e5e5e5;
}

.tab-item {
	flex: 1;
	padding: 30rpx 0;
	text-align: center;
	position: relative;
}

.tab-text {
	font-size: 32rpx;
	color: #666;
	transition: color 0.3s;
}

.tab-item.active .tab-text {
	color: #36cfc9;
	font-weight: 500;
}

/* Tab角标样式 */
.tab-badge {
	position: absolute;
	top: 8rpx;
	right: 20rpx;
	background-color: #ff4d4f;
	border-radius: 20rpx;
	min-width: 32rpx;
	height: 32rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 0 8rpx;
}

.tab-badge .badge-text {
	color: white;
	font-size: 20rpx;
	font-weight: 600;
	line-height: 1;
}

.tab-indicator {
	position: absolute;
	bottom: 0;
	width: 25%;
	height: 4rpx;
	background-color: #36cfc9;
	transition: left 0.3s ease;
}

/* 订单内容区域 */
.order-content {
	padding: 20rpx;
	width: 95%;
}

.order-list {
	padding-bottom: 40rpx;
}

/* 空状态样式 */
.empty-state {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 120rpx 0;
}

.empty-icon {
	width: 120rpx;
	height: 120rpx;
	opacity: 0.3;
	margin-bottom: 30rpx;
}

.empty-text {
	font-size: 28rpx;
	color: #999;
}

/* 订单项样式 */
.order-item {
	background-color: #fff;
	border-radius: 16rpx;
	margin-bottom: 20rpx;
	overflow: hidden;
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.order-header {
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
	padding: 24rpx 30rpx;
	border-bottom: 1px solid #f0f0f0;
}

.order-header-left {
	display: flex;
	flex-direction: column;
	gap: 8rpx;
}

.order-number {
	font-size: 24rpx;
	color: #999;
	font-weight: 400;
}

.order-time {
	font-size: 26rpx;
	color: #666;
}

.order-status {
	font-size: 26rpx;
	font-weight: 500;
	padding: 8rpx 16rpx;
	border-radius: 20rpx;
}

.order-status.pending {
	color: #ff6b35;
	background-color: #fff2e8;
}

.order-status.consumption {
	color: #36cfc9;
	background-color: #e6fffb;
}

.order-status.completed {
	color: #52c41a;
	background-color: #f6ffed;
}

.order-body {
	display: flex;
	padding: 30rpx;
	align-items: flex-start;
}

.order-image {
	width: 120rpx;
	height: 120rpx;
	border-radius: 12rpx;
	margin-right: 24rpx;
}

.order-info {
	flex: 1;
}

.order-name {
	font-size: 32rpx;
	font-weight: 500;
	color: #333;
	margin-bottom: 16rpx;
}

.order-detail {
	display: flex;
	margin-bottom: 12rpx;
}

.detail-label {
	font-size: 26rpx;
	color: #666;
	margin-right: 8rpx;
}

.detail-value {
	font-size: 26rpx;
	color: #333;
}

.order-price-row {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-top: 20rpx;
}

.order-price-section {
	display: flex;
	flex-direction: column;
	align-items: flex-end;
	justify-content: flex-start;
	margin-left: 20rpx;
	min-width: 140rpx;
}

.quantity-container {
	display: flex;
	align-items: center;
}

.quantity-above-price {
	display: flex;
	align-items: center;
	margin-bottom: 8rpx;
	justify-content: flex-end;
}

.order-quantity {
	font-size: 24rpx;
	color: #999;
	background-color: #f5f5f5;
	padding: 4rpx 12rpx;
	border-radius: 12rpx;
}

.order-price {
	font-size: 32rpx;
	font-weight: 500;
	color: #ff6b35;
	text-align: right;
}

/* 订单操作按钮 */
.order-actions {
	display: flex;
	justify-content: flex-end;
	padding: 20rpx 30rpx 30rpx;
	gap: 12rpx;
}

.action-btn {
	padding: 14rpx 24rpx;
	border-radius: 24rpx;
	font-size: 26rpx;
	border: 1px solid transparent;
	cursor: pointer;
	transition: all 0.3s;
	min-width: 140rpx;
	height: 64rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-left: 0;
	margin-right: 0;
}

.cancel-btn {
	background-color: #fff;
	color: #666;
	border: 1px solid #d9d9d9;
}

.cancel-btn:hover {
	background-color: #f5f5f5;
	border-color: #b7b7b7;
}

.pay-btn {
	background-color: #ff6b35;
	color: #fff;
	border: 1px solid #ff6b35;
}

.pay-btn:hover {
	background-color: #ff8c69;
	border-color: #ff8c69;
}

.contact-btn {
	background-color: #fff;
	color: #666;
	border: 1px solid #d9d9d9;
}

.contact-btn:hover {
	background-color: #f5f5f5;
	border-color: #b7b7b7;
}

.confirm-btn {
	background-color: #ff6b35;
	color: #fff;
	border: 1px solid #ff6b35;
}

.confirm-btn:hover {
	background-color: #ff8c69;
	border-color: #ff8c69;
}

.review-btn {
	background-color: #fff;
	color: #666;
	border: 1px solid #d9d9d9;
}

.review-btn:hover {
	background-color: #f5f5f5;
	border-color: #b7b7b7;
}

.delete-btn {
	background-color: #fff;
	color: #666;
	border: 1px solid #d9d9d9;
}

.delete-btn:hover {
	background-color: #f5f5f5;
	border-color: #b7b7b7;
}

.rebuy-btn {
	background-color: #ff6b35;
	color: #fff;
	border: 1px solid #ff6b35;
}

.rebuy-btn:hover {
	background-color: #ff8c69;
	border-color: #ff8c69;
}

/* 新的按钮样式 - 主要按钮 */
.primary-btn {
	background-color: #ff6b35;
	color: #fff;
	border: 1px solid #ff6b35;
}

.primary-btn:hover {
	background-color: #ff8c69;
	border-color: #ff8c69;
}

/* 新的按钮样式 - 次要按钮 */
.secondary-btn {
	background-color: #fff;
	color: #666;
	border: 1px solid #d9d9d9;
}

.secondary-btn:hover {
	background-color: #f5f5f5;
	border-color: #b7b7b7;
}

/* 分页组件样式 */
.pagination {
	display: flex;
	justify-content: center;
	align-items: center;
	padding: 30rpx 0;
	margin-top: 20rpx;
	background-color: #fff;
	border-radius: 16rpx;
	margin: 20rpx;
}

.pagination-controls {
	display: flex;
	align-items: center;
	gap: 8rpx;
}

/* 导航按钮样式 (< >) */
.page-nav-btn {
	width: 64rpx;
	height: 64rpx;
	border-radius: 12rpx;
	border: 1px solid #e5e5e5;
	background-color: #fff;
	color: #666;
	font-size: 28rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
	transition: all 0.3s;
}

.page-nav-btn:hover:not(:disabled) {
	border-color: #36cfc9;
	color: #36cfc9;
}

.page-nav-btn:disabled {
	border-color: #f0f0f0;
	color: #d9d9d9;
	cursor: not-allowed;
	background-color: #fafafa;
}

.nav-icon {
	font-size: 32rpx;
	font-weight: bold;
}

/* 页码按钮样式 */
.page-number-btn {
	width: 64rpx;
	height: 64rpx;
	border-radius: 12rpx;
	border: 1px solid #e5e5e5;
	background-color: #fff;
	color: #666;
	font-size: 28rpx;
	font-weight: 500;
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
	transition: all 0.3s;
}

.page-number-btn:hover:not(.active) {
	border-color: #36cfc9;
	color: #36cfc9;
}

.page-number-btn.active {
	border-color: #36cfc9;
	background-color: #36cfc9;
	color: #fff;
	font-weight: 600;
}

/* 加载状态 */
.loading-state {
	display: flex;
	justify-content: center;
	align-items: center;
	padding: 60rpx 0;
}

.loading-text {
	font-size: 28rpx;
	color: #666;
}
</style>
