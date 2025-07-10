<template>
	<view class="container">
		<!-- 纪念品详情页面 -->
		<view class="souvenir-detail" v-if="souvenirInfo">
			<!-- 纪念品图片 -->
			<view class="souvenir-image">
				<image :src="souvenirInfo.img" mode="aspectFill"></image>
			</view>

			<!-- 纪念品信息 -->
			<view class="souvenir-info">
				<view class="souvenir-header">
					<text class="souvenir-title">{{ souvenirInfo.name }}</text>
					<!-- 喜欢数与标题对齐 -->
					<view class="like-section" @click="toggleLike">
						<image :src="isLiked ? '/static/images/like_selected.png' : '/static/images/like.png'" class="like-icon">
						</image>
						<text class="like-count">{{ souvenirInfo.like }}</text>
					</view>
				</view>

				<!-- Tab切换 -->
				<view class="tab-container">
					<view class="tab-header">
						<view class="tab-item" :class="{ active: activeTab === 'introduction' }" @click="switchTab('introduction')">
							<text>产品介绍</text>
						</view>
						<view class="tab-item" :class="{ active: activeTab === 'notes' }" @click="switchTab('notes')">
							<text>购买须知</text>
						</view>
						<view class="tab-item" :class="{ active: activeTab === 'review' }" @click="switchTab('review')">
							<text>评价</text>
						</view>
						<!-- 滑动指示条 -->
						<view class="tab-indicator" :style="{ left: indicatorPosition }"></view>
					</view>

					<!-- Tab内容 -->
					<view class="tab-content">
						<!-- 产品介绍 -->
						<view v-if="activeTab === 'introduction'" class="content-section">
							<text class="content-text">{{ souvenirInfo.introduction }}</text>
							<view class="product-details">
								<view class="detail-item">
									<text class="detail-label">已售数量：</text>
									<text class="detail-value">{{ souvenirInfo.sale }}件</text>
								</view>
								<view class="detail-item">
									<text class="detail-label">可选尺寸：</text>
									<text class="detail-value">{{ souvenirInfo.size.join('、') }}</text>
								</view>
								<view class="detail-item">
									<text class="detail-label">可选颜色：</text>
									<text class="detail-value">{{ souvenirInfo.color.join('、') }}</text>
								</view>
							</view>
						</view>

						<!-- 购买须知 -->
						<view v-if="activeTab === 'notes'" class="content-section">
							<view class="note-item" v-for="(note, index) in souvenirInfo.buyingNotes" :key="index">
								<text class="note-content">• {{ note }}</text>
							</view>
							<view class="notice-item">
								<text class="notice-title">温馨提示</text>
								<text class="notice-content">• 请仔细核对商品信息后下单\n• 如有质量问题，支持7天无理由退换\n• 特殊定制商品不支持退换货</text>
							</view>
						</view>

						<!-- 评价 -->
						<view v-if="activeTab === 'review'" class="content-section">
							<view class="review-summary">
								<text class="review-score">4.8</text>
								<text class="review-total">共{{ souvenirInfo.like }}条评价</text>
							</view>
							<view class="review-item" v-for="(review, index) in souvenirInfo.reviews" :key="index">
								<view class="review-header">
									<text class="reviewer-name">用户****{{ String(index + 123).slice(-3) }}</text>
									<text class="review-date">2024-01-{{ String(15 - index).padStart(2, '0') }}</text>
								</view>
								<text class="review-content">{{ review }}</text>
							</view>
						</view>
					</view>
				</view>
			</view>
		</view>

		<!-- 悬浮底部订购条 -->
		<view class="bottom-order-bar" v-if="souvenirInfo">
			<view class="price-section">
				<text class="price-label">￥</text>
				<text class="price-value">{{ souvenirInfo.price }}</text>
				<text class="price-unit">.00</text>
			</view>
			<button class="order-btn" @click="showOrderModal">立即订购</button>
		</view>

		<!-- 订购弹窗 -->
		<view class="order-modal" v-if="showModal" @click="closeOrderModal">
			<view class="modal-content" @click.stop>
				<view class="modal-header">
					<text class="modal-title">订购商品</text>
					<text class="close-btn" @click="closeOrderModal">×</text>
				</view>

				<view class="order-form">
					<!-- 数量选择 -->
					<view class="form-item">
						<text class="form-label">数量</text>
						<view class="quantity-control">
							<button class="quantity-btn" @click="decreaseQuantity">-</button>
							<text class="quantity-text">{{ orderForm.quantity }}</text>
							<button class="quantity-btn" @click="increaseQuantity">+</button>
						</view>
					</view>
					<view class="form-divider"></view>

					<!-- 尺寸选择 -->
					<view class="form-item">
						<text class="form-label">尺寸</text>
						<view class="size-options">
							<view class="size-option" :class="{ active: orderForm.selectedSize === size }"
								v-for="size in souvenirInfo.size" :key="size" @click="selectSize(size)">
								<text class="size-text">{{ size }}</text>
							</view>
						</view>
					</view>
					<view class="form-divider"></view>

					<!-- 颜色选择 -->
					<view class="form-item">
						<text class="form-label">颜色</text>
						<view class="color-options">
							<view class="color-option" :class="{ active: orderForm.selectedColor === color }"
								v-for="color in souvenirInfo.color" :key="color" @click="selectColor(color)"
								:style="{ backgroundColor: getColorValue(color) }">
								<text class="color-text" v-if="orderForm.selectedColor === color">✓</text>
							</view>
						</view>
					</view>
					<view class="form-divider"></view>

					<!-- 应付金额 -->
					<view class="form-item">
						<text class="form-label">应付金额</text>
						<view class="total-price">
							<text class="total-amount">￥{{ totalAmount }}.00</text>
						</view>
					</view>
					<view class="form-divider"></view>

					<!-- 用户协议 -->
					<view class="agreement-section">
						<checkbox-group @change="onAgreementChange">
							<label class="agreement-label">
								<checkbox value="agree" :checked="orderForm.agreed" />
								<text class="agreement-text">我已阅读并同意《用户协议》和《隐私政策》</text>
							</label>
						</checkbox-group>
					</view>

					<!-- 提交订单按钮 -->
					<button class="submit-btn" @click="submitOrder" :disabled="!canSubmit">提交订单</button>
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
	CommonSouvenir
} from '../../static/data/CommonData.js'
import {
	addToCart as addToUserCart
} from '../../utils/cartUtils.js'

// 响应式数据
const souvenirInfo = ref(null)
const souvenirId = ref('')
const isLiked = ref(false)
const activeTab = ref('introduction') // 当前激活的tab
const showModal = ref(false) // 控制弹窗显示

// 订单表单数据
const orderForm = ref({
	quantity: 1,
	selectedSize: '',
	selectedColor: '',
	agreed: false
})

// 计算指示条位置
const indicatorPosition = computed(() => {
	const tabIndex = {
		'introduction': 0,
		'notes': 1,
		'review': 2
	}

	const currentIndex = tabIndex[activeTab.value]
	const tabCenterPercent = (currentIndex * 33.33) + 16.665 // 33.33% 是每个tab的宽度，16.665%是中心偏移

	return `calc(${tabCenterPercent}% - 30rpx)` // 30rpx是指示条宽度的一半
})

// 计算总金额
const totalAmount = computed(() => {
	if (!souvenirInfo.value) return 0
	return parseInt(souvenirInfo.value.price) * orderForm.value.quantity
})

// 检查是否可以提交订单
const canSubmit = computed(() => {
	return orderForm.value.selectedSize &&
		orderForm.value.selectedColor &&
		orderForm.value.agreed
})

// 页面加载时获取参数
onLoad((options) => {
	if (options && options.id) {
		souvenirId.value = options.id
		loadSouvenirDetails(options.id)
	} else {
		uni.showToast({
			title: '参数错误',
			icon: 'none'
		})
	}
})

// 加载纪念品详情
function loadSouvenirDetails(id) {
	const souvenir = CommonSouvenir.find(item => item.id === id)

	if (souvenir) {
		// 使用 markRaw 避免深度响应式，提高性能
		souvenirInfo.value = markRaw(souvenir)
		// 设置默认选择
		orderForm.value.selectedSize = souvenir.size[0]
		orderForm.value.selectedColor = souvenir.color[0]
	} else {
		uni.showToast({
			title: '纪念品信息不存在',
			icon: 'none'
		})
	}
}

// 切换tab
function switchTab(tab) {
	activeTab.value = tab
}

// 切换点赞状态
function toggleLike() {
	if (isLiked.value) {
		// 取消点赞
		isLiked.value = false
		souvenirInfo.value.like = String(parseInt(souvenirInfo.value.like) - 1)
	} else {
		// 点赞
		isLiked.value = true
		souvenirInfo.value.like = String(parseInt(souvenirInfo.value.like) + 1)
	}
}

// 显示订购弹窗
function showOrderModal() {
	showModal.value = true
}

// 关闭订购弹窗
function closeOrderModal() {
	showModal.value = false
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

// 选择尺寸
function selectSize(size) {
	orderForm.value.selectedSize = size
}

// 选择颜色
function selectColor(color) {
	orderForm.value.selectedColor = color
}

// 获取颜色值
function getColorValue(color) {
	const colorMap = {
		'red': '#ff4757',
		'blue': '#3742fa',
		'green': '#2ed573',
		'yellow': '#ffa502',
		'black': '#2f3542',
		'white': '#f1f2f6'
	}
	return colorMap[color] || '#ccc'
}

// 协议同意状态变化
function onAgreementChange(e) {
	orderForm.value.agreed = e.detail.value.includes('agree')
}

// 添加到购物车
function addToCart() {
	try {
		// 构造购物车数据格式
		const cartItem = {
			type: souvenirInfo.value.name,
			img: souvenirInfo.value.img,
			count: String(orderForm.value.quantity),
			model: {
				size: orderForm.value.selectedSize,
				color: orderForm.value.selectedColor
			},
			price: String(parseInt(souvenirInfo.value.price) * orderForm.value.quantity)
		}

		// 使用工具类添加到购物车
		const success = addToUserCart('Souvenir', cartItem)

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

		return success
	} catch (error) {
		console.error('添加到购物车失败:', error)
		uni.showToast({
			title: '添加失败，请重试',
			icon: 'none'
		})
		return false
	}
}

// 提交订单
function submitOrder() {
	if (!canSubmit.value) {
		uni.showToast({
			title: '请完善订单信息',
			icon: 'none'
		})
		return
	}

	// 显示订单确认弹窗
	uni.showModal({
		title: '订单确认',
		content: `商品：${souvenirInfo.value.name}\n数量：${orderForm.value.quantity}\n尺寸：${orderForm.value.selectedSize}\n颜色：${orderForm.value.selectedColor}\n总金额：￥${totalAmount.value}.00`,
		success: (res) => {
			if (res.confirm) {
				// 用户确认后，添加到购物车
				const success = addToCart()

				if (success) {
					uni.showToast({
						title: '订单提交成功',
						icon: 'success'
					})
					closeOrderModal()
					// 重置表单
					orderForm.value = {
						quantity: 1,
						selectedSize: souvenirInfo.value.size[0],
						selectedColor: souvenirInfo.value.color[0],
						agreed: false
					}
				}
			}
		}
	})
}
</script>

<style scoped>
page {
	background-color: #fbfbfb;
}

.container {
	width: 100%;
	background-color: #fbfbfb;
	padding-bottom: 120rpx;
	/* 为底部订购条留出空间 */
}

.souvenir-detail {
	width: 100%;
}

/* 纪念品图片 */
.souvenir-image {
	width: 100%;
	height: 400rpx;
	position: relative;
}

.souvenir-image image {
	width: 100%;
	height: 400rpx;
}

/* 纪念品信息 */
.souvenir-info {
	background-color: #fff;
	margin-top: -20rpx;
	border-radius: 20rpx 20rpx 0 0;
	padding: 40rpx 30rpx;
}

.souvenir-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 40rpx;
}

.souvenir-title {
	font-size: 48rpx;
	font-weight: 600;
	color: #333;
	flex: 1;
}

/* 喜欢数样式 */
.like-section {
	display: flex;
	flex-direction: column;
	align-items: center;
	cursor: pointer;
}

.like-icon {
	width: 40rpx;
	height: 40rpx;
	margin-bottom: 8rpx;
}

.like-count {
	font-size: 24rpx;
	color: #666;
	font-weight: 500;
}

/* Tab切换样式 */
.tab-container {
	margin-top: 20rpx;
}

.tab-header {
	display: flex;
	position: relative;
	background-color: #fff;
	border-bottom: 1px solid #e5e5e5;
}

.tab-item {
	flex: 1;
	text-align: center;
	padding: 30rpx 0;
	position: relative;
}

.tab-item text {
	font-size: 28rpx;
	color: #666;
	font-weight: 500;
}

.tab-item.active text {
	color: #36cfc9;
	font-weight: 600;
}

.tab-indicator {
	position: absolute;
	bottom: 0;
	width: 60rpx;
	height: 6rpx;
	background-color: #36cfc9;
	border-radius: 3rpx;
	transition: left 0.3s ease;
}

/* Tab内容样式 */
.tab-content {
	padding: 30rpx;
	min-height: 400rpx;
}

.content-section {
	width: 100%;
}

.content-text {
	display: block;
	font-size: 28rpx;
	color: #666;
	line-height: 1.6;
	margin-bottom: 30rpx;
}

/* 产品详情样式 */
.product-details {
	margin-top: 20rpx;
}

.detail-item {
	display: flex;
	margin-bottom: 20rpx;
}

.detail-label {
	font-size: 28rpx;
	color: #333;
	font-weight: 600;
	width: 160rpx;
	flex-shrink: 0;
}

.detail-value {
	font-size: 28rpx;
	color: #666;
	flex: 1;
}

/* 购买须知样式 */
.note-item {
	margin-bottom: 20rpx;
}

.note-content {
	display: block;
	font-size: 28rpx;
	color: #666;
	line-height: 1.6;
}

.notice-item {
	margin-top: 40rpx;
	padding: 25rpx;
	background-color: #f8f9fa;
	border-radius: 12rpx;
	border-left: 6rpx solid #36cfc9;
}

.notice-title {
	display: block;
	font-size: 32rpx;
	color: #333;
	font-weight: 600;
	margin-bottom: 15rpx;
}

.notice-content {
	display: block;
	font-size: 28rpx;
	color: #666;
	line-height: 1.6;
	white-space: pre-line;
}

/* 评价样式 */
.review-summary {
	display: flex;
	align-items: baseline;
	margin-bottom: 30rpx;
	padding-bottom: 20rpx;
	border-bottom: 1px solid #e5e5e5;
}

.review-score {
	font-size: 48rpx;
	color: #36cfc9;
	font-weight: 700;
	margin-right: 20rpx;
}

.review-total {
	font-size: 28rpx;
	color: #666;
}

.review-item {
	margin-bottom: 30rpx;
	padding: 20rpx;
	background-color: #f8f9fa;
	border-radius: 12rpx;
}

.review-header {
	display: flex;
	justify-content: space-between;
	margin-bottom: 15rpx;
}

.reviewer-name {
	font-size: 28rpx;
	color: #333;
	font-weight: 600;
}

.review-date {
	font-size: 24rpx;
	color: #999;
}

.review-content {
	display: block;
	font-size: 28rpx;
	color: #666;
	line-height: 1.6;
}

/* 悬浮底部订购条样式 */
.bottom-order-bar {
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 20rpx 30rpx;
	background-color: #ffffff;
	border-top: 1px solid #e0e0e0;
	box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.1);
	z-index: 100;
}

.price-section {
	display: flex;
	align-items: baseline;
}

.price-label {
	font-size: 24rpx;
	color: #36cfc9;
	font-weight: 600;
}

.price-value {
	font-size: 36rpx;
	color: #36cfc9;
	font-weight: 700;
	margin: 0 5rpx;
}

.price-unit {
	font-size: 24rpx;
	color: #666;
}

.order-btn {
	background-color: #36cfc9;
	color: #fff;
	border: none;
	border-radius: 50rpx;
	padding: 20rpx 40rpx;
	font-size: 28rpx;
	font-weight: 600;
	/* 按钮长宽比为158:36 */
	width: 316rpx;
	height: 72rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-right: 0;
}

.order-btn:active {
	background-color: #2bb8bb;
}

/* 订购弹窗样式 */
.order-modal {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: rgba(0, 0, 0, 0.5);
	display: flex;
	align-items: flex-end;
	z-index: 999;
}

.modal-content {
	width: 100%;
	background-color: #ffffff;
	border-radius: 20rpx 20rpx 0 0;
	padding: 0;
	animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
	from {
		transform: translateY(100%);
	}

	to {
		transform: translateY(0);
	}
}

.modal-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 30rpx;
	border-bottom: 1px solid #f0f0f0;
}

.modal-title {
	font-size: 32rpx;
	font-weight: 600;
	color: #333;
}

.close-btn {
	font-size: 48rpx;
	color: #999;
	cursor: pointer;
	width: 60rpx;
	height: 60rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.order-form {
	padding: 30rpx;
}

.form-item {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 25rpx 0;
}

.form-label {
	font-size: 28rpx;
	color: #333;
	font-weight: 500;
	width: 160rpx;
	flex-shrink: 0;
}

.form-divider {
	height: 1rpx;
	background-color: #f0f0f0;
	margin: 0 -30rpx;
}

/* 数量控制 */
.quantity-control {
	display: flex;
	align-items: center;
	gap: 16rpx;
}

.quantity-btn {
	width: 50rpx;
	height: 50rpx;
	border: 1px solid #e0e0e0;
	background-color: #fff;
	border-radius: 8rpx;
	font-size: 28rpx;
	color: #333;
	display: flex;
	justify-content: center;
	align-items: center;
}

.quantity-text {
	font-size: 26rpx;
	color: #333;
	min-width: 50rpx;
	text-align: center;
}

/* 尺寸选择 */
.size-options {
	display: flex;
	gap: 12rpx;
	flex-wrap: wrap;
}

.size-option {
	padding: 12rpx 20rpx;
	border: 1px solid #e0e0e0;
	border-radius: 6rpx;
	background-color: #fff;
	cursor: pointer;
}

.size-option.active {
	border-color: #36cfc9;
	background-color: #f0fffe;
}

.size-text {
	font-size: 24rpx;
	color: #333;
}

.size-option.active .size-text {
	color: #36cfc9;
	font-weight: 600;
}

/* 颜色选择 */
.color-options {
	display: flex;
	gap: 12rpx;
	flex-wrap: wrap;
}

.color-option {
	width: 50rpx;
	height: 50rpx;
	border-radius: 50%;
	border: 2rpx solid transparent;
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
	position: relative;
}

.color-option.active {
	border-color: #36cfc9;
}

.color-text {
	font-size: 20rpx;
	color: #fff;
	font-weight: 600;
}

/* 总价显示 */
.total-price {
	display: flex;
	align-items: center;
}

.total-amount {
	font-size: 32rpx;
	color: #36cfc9;
	font-weight: 700;
}

/* 协议部分 */
.agreement-section {
	padding: 25rpx 0;
}

.agreement-label {
	display: flex;
	align-items: center;
}

.agreement-text {
	font-size: 26rpx;
	color: #666;
	margin-left: 15rpx;
}

/* 提交按钮 */
.submit-btn {
	width: 100%;
	background-color: #36cfc9;
	color: #fff;
	border: none;
	border-radius: 10rpx;
	padding: 18rpx;
	font-size: 28rpx;
	font-weight: 600;
	margin-top: 24rpx;
	height: 70rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.submit-btn:disabled {
	background-color: #ccc;
	color: #999;
}

.submit-btn:active:not(:disabled) {
	background-color: #2bb8bb;
}
</style>