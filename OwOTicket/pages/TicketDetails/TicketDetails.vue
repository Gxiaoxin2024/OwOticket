<template>
	<view class="container">
		<!-- 门票详情页面 -->
		<view class="ticket-detail" v-if="ticketInfo">
			<!-- 门票图片轮播 -->
			<view class="ticket-image-section">
				<swiper :indicator-dots="true" :autoplay="false" :interval="3000" :duration="500" class="ticket-swiper">
					<swiper-item>
						<image :src="ticketInfo.img" mode="aspectFill" class="ticket-image"></image>
					</swiper-item>
					<swiper-item>
						<image src="/static/images/ticket_scene_1.jpg" mode="aspectFill" class="ticket-image"></image>
					</swiper-item>
					<swiper-item>
						<image src="/static/images/ticket_scene_2.jpg" mode="aspectFill" class="ticket-image"></image>
					</swiper-item>
				</swiper>
			</view>

			<!-- 门票基本信息 -->
			<view class="ticket-info">
				<view class="ticket-header">
					<text class="ticket-title">{{ ticketInfo.name }}</text>
					<view class="ticket-subtitle">
						<text class="subtitle-text">{{ ticketInfo.refer }}</text>
					</view>

					<!-- 评分和销量 -->
					<view class="rating-section">
						<view class="rating-stars">
							<text class="star">★★★★☆</text>
							<text class="rating-score">4.8</text>
						</view>
						<text class="sales-count">已售 {{ getRandomSales() }} 份</text>
					</view>
				</view>

				<!-- 库存状态 -->
				<view class="stock-section">
					<view class="stock-item">
						<text class="stock-label">库存状态</text>
						<text class="stock-value available">充足</text>
					</view>
					<view class="stock-item">
						<text class="stock-label">余票提示</text>
						<text class="stock-value">剩余 {{ getRandomStock() }} 张</text>
					</view>
				</view>

				<!-- 适用人群 -->
				<view class="audience-section">
					<text class="section-title">适用人群</text>
					<view class="audience-tags">
						<text class="audience-tag" v-for="tag in getAudienceTags()" :key="tag">{{ tag }}</text>
					</view>
					<view class="restrictions">
						<text class="restriction-title">使用限制：</text>
						<text class="restriction-text">{{ getRestrictions() }}</text>
					</view>
				</view>

				<!-- 用户评价 -->
				<view class="reviews-section">
					<view class="reviews-header">
						<text class="section-title">用户评价</text>
						<text class="reviews-count">({{ getRandomReviewCount() }}条评价)</text>
					</view>
					<view class="review-item" v-for="review in getReviews()" :key="review.id">
						<view class="review-header">
							<text class="reviewer-name">{{ review.name }}</text>
							<text class="review-rating">{{ review.rating }}</text>
						</view>
						<text class="review-content">{{ review.content }}</text>
					</view>
				</view>

				<!-- 常见问题 -->
				<view class="faq-section">
					<text class="section-title">常见问题</text>
					<view class="faq-item" v-for="faq in getFAQs()" :key="faq.id">
						<text class="faq-question">Q: {{ faq.question }}</text>
						<text class="faq-answer">A: {{ faq.answer }}</text>
					</view>
				</view>

				<!-- 底部占位，避免被固定按钮遮挡 -->
				<view class="bottom-placeholder"></view>
			</view>

			<!-- 底部购买区域 -->
			<view class="buy-section">
				<view class="price-display">
					<text class="price-label">门票价格</text>
					<text class="ticket-price">￥{{ ticketInfo.price }}.00</text>
				</view>
				<button class="buy-btn" @click="buyTicket">立即购买</button>
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
								<button class="quantity-btn-small" @click="decreaseQuantity">-</button>
								<text class="quantity-text">{{ orderForm.quantity }}</text>
								<button class="quantity-btn-small" @click="increaseQuantity">+</button>
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
					<button class="submit-btn-small" @click="submitOrder">提交订单</button>
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
	agreed: false
})

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
	return parseInt(ticketInfo.value.price) * orderForm.value.quantity
})

// 生成随机销量
function getRandomSales() {
	return Math.floor(Math.random() * 5000) + 1000
}

// 生成随机库存
function getRandomStock() {
	return Math.floor(Math.random() * 500) + 100
}

// 获取适用人群标签
function getAudienceTags() {
	const ticketTags = {
		'1': ['成人', '学生', '情侣'],
		'2': ['家庭', '儿童', '成人'],
		'3': ['学生', '青年'],
		'4': ['老人', '成人']
	}
	return ticketTags[ticketInfo.value?.id] || ['成人']
}

// 获取使用限制
function getRestrictions() {
	const restrictions = {
		'1': '仅限单人使用，当天有效，需携带身份证',
		'2': '适合2大1小家庭，需提前预约，儿童需成人陪同',
		'3': '需出示学生证，仅限在校学生使用',
		'4': '需出示身份证，仅限60岁以上老人使用'
	}
	return restrictions[ticketInfo.value?.id] || '请按规定使用'
}

// 生成随机评价数量
function getRandomReviewCount() {
	return Math.floor(Math.random() * 1000) + 200
}

// 获取用户评价
function getReviews() {
	return [
		{
			id: 1,
			name: '用户***123',
			rating: '★★★★★',
			content: '非常不错的体验，景色优美，服务周到，值得推荐！'
		},
		{
			id: 2,
			name: '游客***456',
			rating: '★★★★☆',
			content: '整体还可以，就是人有点多，建议错峰出行。'
		},
		{
			id: 3,
			name: '旅行者***789',
			rating: '★★★★★',
			content: '带孩子来玩很开心，设施齐全，安全措施到位。'
		}
	]
}

// 获取常见问题
function getFAQs() {
	return [
		{
			id: 1,
			question: '门票是否可以退改？',
			answer: '门票支持免费退改，需在使用前24小时申请。'
		},
		{
			id: 2,
			question: '是否需要提前预约？',
			answer: '建议提前预约，特别是节假日期间，以确保顺利入园。'
		},
		{
			id: 3,
			question: '儿童是否需要购票？',
			answer: '1.2米以下儿童免票，1.2-1.5米儿童半价，1.5米以上全价。'
		},
		{
			id: 4,
			question: '园区内是否有餐饮服务？',
			answer: '园区内设有多个餐厅和小食店，提供丰富的餐饮选择。'
		}
	]
}



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
			agreed: false
		}
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

/* 门票图片轮播 */
.ticket-image-section {
	width: 100%;
	height: 400rpx;
}

.ticket-swiper {
	width: 100%;
	height: 400rpx;
}

.ticket-image {
	width: 100%;
	height: 400rpx;
}

/* 门票信息 */
.ticket-info {
	background-color: #fff;
	margin-top: -20rpx;
	border-radius: 20rpx 20rpx 0 0;
	padding: 40rpx 30rpx;
	padding-bottom: 140rpx;
	/* 为底部固定区域留出空间 */
}

.ticket-header {
	margin-bottom: 40rpx;
}

.ticket-title {
	display: block;
	font-size: 48rpx;
	font-weight: 600;
	color: #333;
	margin-bottom: 16rpx;
}

.ticket-subtitle {
	margin-bottom: 20rpx;
}

.subtitle-text {
	font-size: 28rpx;
	color: #666;
	line-height: 1.5;
}

/* 评分区域 */
.rating-section {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 30rpx;
}

.rating-stars {
	display: flex;
	align-items: center;
	gap: 8rpx;
}

.star {
	color: #ffa940;
	font-size: 28rpx;
}

.rating-score {
	font-size: 28rpx;
	color: #333;
	font-weight: 500;
}

.sales-count {
	font-size: 24rpx;
	color: #999;
}

/* 库存状态 */
.stock-section {
	display: flex;
	justify-content: space-between;
	padding: 24rpx;
	background-color: #f8f9fa;
	border-radius: 12rpx;
	margin-bottom: 30rpx;
}

.stock-item {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 8rpx;
}

.stock-label {
	font-size: 24rpx;
	color: #666;
}

.stock-value {
	font-size: 28rpx;
	font-weight: 500;
}

.stock-value.available {
	color: #52c41a;
}

/* 通用区域样式 */
.section-title {
	display: block;
	font-size: 32rpx;
	font-weight: 600;
	color: #333;
	margin-bottom: 20rpx;
}

/* 适用人群 */
.audience-section {
	margin-bottom: 40rpx;
}

.audience-tags {
	display: flex;
	flex-wrap: wrap;
	gap: 12rpx;
	margin-bottom: 20rpx;
}

.audience-tag {
	padding: 8rpx 16rpx;
	background-color: #e6f7ff;
	color: #1890ff;
	border-radius: 20rpx;
	font-size: 24rpx;
}

.restrictions {
	padding: 16rpx;
	background-color: #fff7e6;
	border-radius: 8rpx;
	border-left: 4rpx solid #ffa940;
}

.restriction-title {
	font-size: 26rpx;
	color: #d46b08;
	font-weight: 500;
}

.restriction-text {
	font-size: 26rpx;
	color: #d46b08;
}

/* 用户评价 */
.reviews-section {
	margin-bottom: 40rpx;
}

.reviews-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 20rpx;
}

.reviews-count {
	font-size: 24rpx;
	color: #999;
}

.review-item {
	padding: 20rpx;
	background-color: #fafafa;
	border-radius: 12rpx;
	margin-bottom: 16rpx;
}

.review-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 12rpx;
}

.reviewer-name {
	font-size: 26rpx;
	color: #666;
}

.review-rating {
	font-size: 24rpx;
	color: #ffa940;
}

.review-content {
	font-size: 28rpx;
	color: #333;
	line-height: 1.5;
}

/* 常见问题 */
.faq-section {
	margin-bottom: 40rpx;
}

.faq-item {
	margin-bottom: 24rpx;
	padding: 20rpx;
	background-color: #f8f9fa;
	border-radius: 12rpx;
}

.faq-question {
	display: block;
	font-size: 28rpx;
	color: #333;
	font-weight: 500;
	margin-bottom: 12rpx;
}

.faq-answer {
	display: block;
	font-size: 26rpx;
	color: #666;
	line-height: 1.5;
}

/* 底部占位 */
.bottom-placeholder {
	height: 40rpx;
}

/* 底部购买区域 */
.buy-section {
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	background-color: #fff;
	padding: 20rpx 30rpx;
	border-top: 1px solid #e5e5e5;
	box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.1);
	display: flex;
	justify-content: space-between;
	align-items: center;
	gap: 20rpx;
}

.price-display {
	display: flex;
	flex-direction: column;
	align-items: flex-start;
	flex: 3;
}

.price-label {
	font-size: 24rpx;
	color: #666;
	margin-bottom: 4rpx;
}

.ticket-price {
	font-size: 48rpx;
	font-weight: 700;
	color: #36cfc9;
}

.buy-btn {
	flex: 7;
	background-color: #36cfc9;
	color: #fff;
	border: none;
	border-radius: 40rpx;
	padding: 24rpx 0;
	font-size: 28rpx;
	font-weight: 600;
	height: 80rpx;
	display: flex;
	align-items: center;
	justify-content: center;
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

.quantity-btn-small {
	width: 50rpx;
	height: 50rpx;
	border: 1px solid #e5e5e5;
	background-color: #fff;
	border-radius: 8rpx;
	font-size: 28rpx;
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

/* 提交按钮 - 小尺寸 */
.submit-btn-small {
	width: 100%;
	background-color: #36cfc9;
	color: #fff;
	border: none;
	border-radius: 40rpx;
	padding: 20rpx 0;
	font-size: 28rpx;
	font-weight: 600;
	margin-top: 20rpx;
	height: 70rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.submit-btn-small:active {
	background-color: #2bb8bb;
}
</style>