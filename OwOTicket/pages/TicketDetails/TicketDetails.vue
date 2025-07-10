<template>
	<view class="container">
		<!-- 门票详情页面 -->
		<view class="ticket-detail" v-if="ticketInfo">
			<!-- 门票图片 -->
			<view class="ticket-image">
				<image :src="ticketInfo.img" mode="aspectFill"></image>
			</view>

			<!-- 门票信息 -->
			<view class="ticket-info">
				<view class="ticket-header">
					<text class="ticket-title">{{ ticketInfo.name }}</text>
					<view class="ticket-price-section">
						<text class="price-label">门票价格</text>
						<text class="ticket-price">￥{{ ticketInfo.price }}.00</text>
					</view>
				</view>

				<view class="ticket-description">
					<text class="description-title">门票说明</text>
					<text class="description-content">{{ ticketInfo.refer }}</text>
				</view>

				<!-- 购买按钮 -->
				<view class="buy-section">
					<button class="buy-btn" @click="buyTicket">立即购买</button>
				</view>
			</view>
		</view>

		<!-- 加载状态 -->
		<view v-else class="loading">
			<text>加载中...</text>
		</view>

		<!-- 购买弹窗遮罩 -->
		<view v-if="showOrderModal" class="modal-overlay" @click="closeOrderModal">
			<view class="order-modal" @click.stop>
				<!-- 弹窗头部 -->
				<view class="modal-header">
					<text class="modal-title">订购信息</text>
					<view class="close-btn" @click="closeOrderModal">×</view>
				</view>

				<!-- 订购表单 -->
				<view class="order-form">
					<!-- 数量 -->
					<view class="form-item">
						<text class="label">数量</text>
						<view class="input-section">
							<view class="quantity-control">
								<button class="quantity-btn" @click="decreaseQuantity">-</button>
								<text class="quantity-text">{{ orderForm.quantity }}</text>
								<button class="quantity-btn" @click="increaseQuantity">+</button>
							</view>
						</view>
					</view>

					<!-- 使用时间 -->
					<view class="form-item">
						<text class="label">使用时间</text>
						<view class="input-section">
							<picker mode="date" :value="orderForm.date" @change="onDateChange">
								<view class="date-picker">
									<text>{{ orderForm.date || '请选择使用时间' }}</text>
									<text class="picker-arrow">></text>
								</view>
							</picker>
						</view>
					</view>

					<!-- 红包 -->
					<view class="form-item">
						<text class="label">红包</text>
						<view class="input-section">
							<picker :range="coupons" range-key="name" @change="onCouponChange">
								<view class="coupon-picker">
									<text>{{ selectedCoupon ? selectedCoupon.name : '选择红包优惠' }}</text>
									<text class="picker-arrow">></text>
								</view>
							</picker>
						</view>
					</view>

					<!-- 应付金额 -->
					<view class="form-item">
						<text class="label">应付金额</text>
						<view class="input-section">
							<text class="total-amount">￥{{ totalAmount }}.00</text>
						</view>
					</view>

					<!-- 用户协议 -->
					<view class="agreement-section">
						<checkbox-group @change="onAgreementChange">
							<label class="agreement-label">
								<checkbox value="agree" :checked="orderForm.agreed" />
								<text>我已阅读并同意</text>
								<text class="agreement-link">《用户协议》</text>
							</label>
						</checkbox-group>
					</view>

					<!-- 提交订单按钮 -->
					<button class="submit-btn" @click="submitOrder">提交订单</button>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import {
	ref,
	computed,
	markRaw
} from 'vue'
import {
	onLoad
} from '@dcloudio/uni-app'
import {
	CommonTicketing
} from '../../static/data/CommonData.js'
import {
	addToCart as addToUserCart
} from '../../utils/cartUtils.js'

// 响应式数据
const ticketInfo = ref(null)
const ticketId = ref('')
const showOrderModal = ref(false)

// 订单表单数据
const orderForm = ref({
	quantity: 1,
	date: '',
	couponIndex: -1,
	agreed: false
})

// 红包数据
const coupons = ref([{
	name: '无优惠',
	discount: 0
},
{
	name: '新用户立减5元',
	discount: 5
},
{
	name: '满50减10元',
	discount: 10
},
{
	name: '满100减20元',
	discount: 20
}
])

const selectedCoupon = ref(null)

// 页面加载时获取参数
onLoad((options) => {
	if (options && options.id) {
		ticketId.value = options.id
		loadTicketDetails(options.id)
	} else {
		uni.showToast({
			title: '参数错误',
			icon: 'none'
		})
	}
})

// 加载门票详情
function loadTicketDetails(id) {
	const ticket = CommonTicketing.find(item => item.id === id)

	if (ticket) {
		// 使用 markRaw 避免深度响应式，提高性能
		ticketInfo.value = markRaw(ticket)
	} else {
		uni.showToast({
			title: '门票信息不存在',
			icon: 'none'
		})
	}
}

// 计算总金额
const totalAmount = computed(() => {
	if (!ticketInfo.value) return 0
	const baseAmount = parseInt(ticketInfo.value.price) * orderForm.value.quantity
	const discount = selectedCoupon.value ? selectedCoupon.value.discount : 0
	return Math.max(0, baseAmount - discount)
})



// 购买门票 - 显示弹窗
function buyTicket() {
	showOrderModal.value = true
}

// 关闭弹窗
function closeOrderModal() {
	showOrderModal.value = false
}

// 增加数量
function increaseQuantity() {
	orderForm.value.quantity++
}

// 减少数量
function decreaseQuantity() {
	if (orderForm.value.quantity > 1) {
		orderForm.value.quantity--
	}
}

// 日期选择
function onDateChange(e) {
	orderForm.value.date = e.detail.value
}

// 红包选择
function onCouponChange(e) {
	const index = e.detail.value
	orderForm.value.couponIndex = index
	selectedCoupon.value = coupons.value[index]
}

// 协议勾选
function onAgreementChange(e) {
	orderForm.value.agreed = e.detail.value.includes('agree')
}



// 添加到购物车
async function addToCart() {
	try {
		// 创建购物车项目数据
		const cartItem = {
			type: ticketInfo.value.name,
			img: ticketInfo.value.img,
			count: orderForm.value.quantity.toString(),
			scheduledTime: orderForm.value.date,
			price: ticketInfo.value.price
		}

		// 使用工具类添加到购物车
		return await addToUserCart('Ticketing', cartItem)
	} catch (error) {
		console.error('添加到购物车失败:', error)
		return false
	}
}

// 提交订单
async function submitOrder() {
	// 验证使用时间
	if (!orderForm.value.date) {
		uni.showModal({
			title: '提示',
			content: '请选择使用时间',
			showCancel: false,
			confirmText: '确定'
		})
		return
	}

	// 验证用户协议
	if (!orderForm.value.agreed) {
		uni.showModal({
			title: '提示',
			content: '请阅读并同意用户协议',
			showCancel: false,
			confirmText: '确定'
		})
		return
	}

	// 所有验证通过，提交订单
	uni.showLoading({
		title: '提交中...'
	})

	try {
		// 添加到购物车
		const success = await addToCart()

		uni.hideLoading()

		if (success) {
			uni.showToast({
				title: '已添加到购物车',
				icon: 'success'
			})
		} else {
			uni.showToast({
				title: '添加失败，请重试',
				icon: 'none'
			})
		}

		closeOrderModal()
		// 重置表单
		orderForm.value = {
			quantity: 1,
			date: '',
			couponIndex: -1,
			agreed: false
		}
		selectedCoupon.value = null
	} catch (error) {
		uni.hideLoading()
		console.error('提交订单失败:', error)
		uni.showToast({
			title: '提交失败，请重试',
			icon: 'none'
		})
	}
}
</script>

<style scoped>
page {
	background-color: #fbfbfb;
}

.container {
	width: 100%;
	background-color: #fbfbfb;
}

.ticket-detail {
	width: 100%;
}

/* 门票图片 */
.ticket-image {
	width: 100%;
	height: 400rpx;
}

.ticket-image image {
	width: 100%;
	height: 400rpx;
}

/* 门票信息 */
.ticket-info {
	background-color: #fff;
	margin-top: -20rpx;
	border-radius: 20rpx 20rpx 0 0;
	padding: 40rpx 30rpx;
}

.ticket-header {
	margin-bottom: 40rpx;
}

.ticket-title {
	display: block;
	font-size: 48rpx;
	font-weight: 600;
	color: #333;
	margin-bottom: 20rpx;
}

.ticket-price-section {
	display: flex;
	align-items: baseline;
	gap: 10rpx;
}

.price-label {
	font-size: 28rpx;
	color: #666;
}

.ticket-price {
	font-size: 56rpx;
	font-weight: 700;
	color: #36cfc9;
}

/* 门票说明 */
.ticket-description {
	margin-bottom: 60rpx;
}

.description-title {
	display: block;
	font-size: 32rpx;
	font-weight: 600;
	color: #333;
	margin-bottom: 20rpx;
}

.description-content {
	display: block;
	font-size: 28rpx;
	color: #666;
	line-height: 1.6;
}

/* 购买按钮 */
.buy-section {
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	background-color: #fff;
	padding: 20rpx 30rpx 40rpx;
	border-top: 1px solid #e5e5e5;
	box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.buy-btn {
	width: 100%;
	background-color: #36cfc9;
	color: #fff;
	border: none;
	border-radius: 50rpx;
	padding: 30rpx 0;
	font-size: 32rpx;
	font-weight: 600;
}

.buy-btn:active {
	background-color: #2bb8bb;
}

/* 加载状态 */
.loading {
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	height: 100vh;
	gap: 20rpx;
}

.loading text {
	font-size: 32rpx;
	color: #666;
}

/* 弹窗样式 */
.modal-overlay {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: rgba(0, 0, 0, 0.5);
	display: flex;
	align-items: flex-end;
	animation: fadeIn 0.3s ease-out;
}

.order-modal {
	width: 100%;
	background-color: #fff;
	border-radius: 20rpx 20rpx 0 0;
	max-height: 80vh;
	animation: slideUp 0.3s ease-out;
}

@keyframes fadeIn {
	from {
		opacity: 0;
	}

	to {
		opacity: 1;
	}
}

@keyframes slideUp {
	from {
		transform: translateY(100%);
	}

	to {
		transform: translateY(0);
	}
}

/* 弹窗头部 */
.modal-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 30rpx;
	border-bottom: 1px solid #e5e5e5;
}

.modal-title {
	font-size: 36rpx;
	font-weight: 600;
	color: #333;
}

.close-btn {
	width: 60rpx;
	height: 60rpx;
	display: flex;
	justify-content: center;
	align-items: center;
	font-size: 40rpx;
	color: #999;
	background-color: #f5f5f5;
	border-radius: 50%;
}

/* 订单表单 */
.order-form {
	padding: 0 30rpx 30rpx;
	max-height: 60vh;
	overflow-y: auto;
}

.form-item {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 30rpx 0;
	border-bottom: 1px solid #e5e5e5;
}

.form-item:last-of-type {
	border-bottom: none;
}

.label {
	font-size: 32rpx;
	color: #333;
	width: 200rpx;
	flex-shrink: 0;
}

.input-section {
	flex: 1;
	display: flex;
	justify-content: flex-end;
}

.form-input {
	width: 100%;
	text-align: right;
	font-size: 32rpx;
	color: #333;
}

/* 数量控制 */
.quantity-control {
	display: flex;
	align-items: center;
	gap: 20rpx;
}

.quantity-btn {
	width: 60rpx;
	height: 60rpx;
	border: 1px solid #e5e5e5;
	background-color: #fff;
	border-radius: 8rpx;
	font-size: 32rpx;
	color: #333;
	display: flex;
	justify-content: center;
	align-items: center;
}

.quantity-text {
	font-size: 32rpx;
	color: #333;
	min-width: 60rpx;
	text-align: center;
}

/* 选择器样式 */
.date-picker,
.coupon-picker {
	display: flex;
	justify-content: space-between;
	align-items: center;
	width: 100%;
	color: #333;
	font-size: 32rpx;
}

.picker-arrow {
	color: #999;
	font-size: 24rpx;
}

/* 总金额 */
.total-amount {
	font-size: 36rpx;
	font-weight: 700;
	color: #36cfc9;
}

/* 用户协议 */
.agreement-section {
	padding: 30rpx 0 20rpx;
}

.agreement-label {
	display: flex;
	align-items: center;
	gap: 10rpx;
	font-size: 28rpx;
	color: #666;
}

.agreement-link {
	color: #36cfc9;
}

/* 提交按钮 */
.submit-btn {
	width: 100%;
	background-color: #36cfc9;
	color: #fff;
	border: none;
	border-radius: 50rpx;
	padding: 30rpx 0;
	font-size: 32rpx;
	font-weight: 600;
	margin-top: 20rpx;
}

.submit-btn:active {
	background-color: #2bb8bb;
}
</style>