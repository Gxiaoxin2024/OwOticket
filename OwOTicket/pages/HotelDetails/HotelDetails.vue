<template>
	<view class="container">
		<!-- 住宿详情页面 -->
		<view class="hotel-detail" v-if="hotelInfo">
			<!-- 住宿图片 -->
			<view class="hotel-image">
				<image :src="hotelInfo.img" mode="aspectFill"></image>
			</view>

			<!-- 住宿信息 -->
			<view class="hotel-info">
				<view class="hotel-header">
					<text class="hotel-title">{{ hotelInfo.name }}</text>
					<!-- 喜欢数与标题对齐 -->
					<view class="like-section" @click="toggleLike">
						<image :src="isLiked ? '/static/images/like_selected.png' : '/static/images/like.png'" class="like-icon">
						</image>
						<text class="like-count">{{ hotelInfo.like }}</text>
					</view>
				</view>

				<!-- Tab切换 -->
				<view class="tab-container">
					<view class="tab-header">
						<view class="tab-item" :class="{ active: activeTab === 'facilities' }" @click="switchTab('facilities')">
							<text>房间设施</text>
						</view>
						<view class="tab-item" :class="{ active: activeTab === 'rules' }" @click="switchTab('rules')">
							<text>入住须知</text>
						</view>
						<view class="tab-item" :class="{ active: activeTab === 'services' }" @click="switchTab('services')">
							<text>尊享服务</text>
						</view>
						<view class="tab-item" :class="{ active: activeTab === 'review' }" @click="switchTab('review')">
							<text>评价</text>
						</view>
						<!-- 滑动指示条 -->
						<view class="tab-indicator" :style="{ left: indicatorPosition }"></view>
					</view>

					<!-- Tab内容 -->
					<view class="tab-content">
						<!-- 房间设施 -->
						<view v-if="activeTab === 'facilities'" class="content-section">
							<text class="content-text">{{ hotelInfo.introduction }}</text>
							<view class="facilities-grid">
								<view class="facility-item" v-for="(facility, index) in hotelInfo.facilities" :key="index">
									<text class="facility-text">{{ facility }}</text>
								</view>
							</view>
							<view class="intro-details">
								<view class="detail-item">
									<text class="detail-label">房间特色：</text>
									<text class="detail-value">{{ hotelInfo.refer }}</text>
								</view>
								<view class="detail-item">
									<text class="detail-label">房间面积：</text>
									<text class="detail-value">25-35平方米</text>
								</view>
								<view class="detail-item">
									<text class="detail-label">床型：</text>
									<text class="detail-value">大床房/双床房</text>
								</view>
							</view>
						</view>

						<!-- 入住须知 -->
						<view v-if="activeTab === 'rules'" class="content-section">
							<view class="rule-item" v-for="(rule, index) in hotelInfo.checkinRules" :key="index">
								<text class="rule-content">• {{ rule }}</text>
							</view>
							<view class="notice-item">
								<text class="notice-title">温馨提示</text>
								<text class="notice-content">• 请提前联系酒店确认入住信息\n• 如需延迟入住请提前告知\n• 房间内禁止吸烟，违者将承担相应费用</text>
							</view>
						</view>

						<!-- 尊享服务 -->
						<view v-if="activeTab === 'services'" class="content-section">
							<view class="service-item" v-for="(service, index) in hotelInfo.services" :key="index">
								<view class="service-content">
									<text class="service-title">{{ service }}</text>
									<text class="service-desc">为您提供贴心周到的服务体验</text>
								</view>
							</view>
						</view>

						<!-- 评价 -->
						<view v-if="activeTab === 'review'" class="content-section">
							<view class="review-summary">
								<text class="review-score">4.9</text>
								<text class="review-total">共{{ hotelInfo.like }}条评价</text>
							</view>
							<view class="review-item">
								<view class="review-header">
									<text class="reviewer-name">用户****123</text>
									<text class="review-date">2024-01-15</text>
								</view>
								<text class="review-content">房间很干净，设施齐全，服务态度很好，位置也很方便，下次还会选择这里！</text>
							</view>
							<view class="review-item">
								<view class="review-header">
									<text class="reviewer-name">用户****456</text>
									<text class="review-date">2024-01-12</text>
								</view>
								<text class="review-content">性价比很高，房间温馨舒适，前台服务很专业，推荐给大家。</text>
							</view>
							<view class="review-item">
								<view class="review-header">
									<text class="reviewer-name">用户****789</text>
									<text class="review-date">2024-01-10</text>
								</view>
								<text class="review-content">环境很好，很安静，适合休息，早餐也不错，整体体验很满意。</text>
							</view>
						</view>
					</view>
				</view>
			</view>
		</view>

		<!-- 悬浮底部订购条 -->
		<view class="bottom-booking-bar" v-if="hotelInfo">
			<view class="price-section">
				<text class="price-label">￥</text>
				<text class="price-value">{{ hotelInfo.price }}</text>
				<text class="price-unit">/晚</text>
			</view>
			<view class="action-icons">
				<view class="icon-item" @click="contactService">
					<image src="/static/images/service.png" class="action-icon"></image>
				</view>
			</view>
			<button class="booking-btn" @click="bookNow">入住订购</button>
		</view>

		<!-- 加载状态 -->
		<view v-else class="loading">
			<text>加载中...</text>
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
		CommonHotel
	} from '../../static/data/CommonData.js'
	import {
		addToCart as addToUserCart
	} from '../../utils/cartUtils.js'

	// 响应式数据
	const hotelInfo = ref(null)
	const hotelId = ref('')
	const isLiked = ref(false)
	const activeTab = ref('facilities') // 当前激活的tab

	// 计算指示条位置 - 使用百分比避免固定值问题
	const indicatorPosition = computed(() => {
		const tabIndex = {
			'facilities': 0,
			'rules': 1,
			'services': 2,
			'review': 3
		}

		const currentIndex = tabIndex[activeTab.value]

		// 使用百分比计算，每个tab占25%
		// 指示条应该在每个tab的中心位置
		const tabCenterPercent = (currentIndex * 25) + 12.5 // 12.5% 是每个tab的中心偏移

		return `calc(${tabCenterPercent}% - 30rpx)` // 30rpx是指示条宽度的一半
	})

	// 页面加载时获取参数
	onLoad((options) => {
		if (options && options.id) {
			hotelId.value = options.id
			loadHotelDetails(options.id)
		} else {
			uni.showToast({
				title: '参数错误',
				icon: 'none'
			})
		}
	})

	// 加载住宿详情
	function loadHotelDetails(id) {
		const hotel = CommonHotel.find(item => item.id === id)

		if (hotel) {
			// 使用 markRaw 避免深度响应式，提高性能
			hotelInfo.value = markRaw(hotel)
		} else {
			uni.showToast({
				title: '住宿信息不存在',
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
			hotelInfo.value.like = String(parseInt(hotelInfo.value.like) - 1)
		} else {
			// 点赞
			isLiked.value = true
			hotelInfo.value.like = String(parseInt(hotelInfo.value.like) + 1)
		}
	}

	// 联系客服
	function contactService() {
		uni.showToast({
			title: '客服功能开发中',
			icon: 'none'
		})
	}

	// 添加到购物车
	function addToCart() {
		try {
			// 获取今天的日期
			const today = new Date()
			const year = today.getFullYear()
			const month = String(today.getMonth() + 1).padStart(2, '0')
			const day = String(today.getDate()).padStart(2, '0')
			const todayDate = `${year}-${month}-${day}`

			// 创建购物车项目数据
			const cartItem = {
				type: hotelInfo.value.name,
				img: hotelInfo.value.img,
				count: "1",
				scheduledTime: todayDate,
				price: hotelInfo.value.price
			}

			// 使用工具类添加到购物车
			const success = addToUserCart('Hotel', cartItem)

			if (success) {
				// 显示成功提示
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

	// 入住订购（原立即预订功能）
	function bookNow() {
		// 先添加到购物车，然后跳转
		const success = addToCart()

		if (success) {
			// 减少延迟时间，提升用户体验
			setTimeout(() => {
				uni.switchTab({
					url: '/pages/myCart/myCart'
				})
			}, 500)
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
		padding-bottom: 120rpx;
		/* 为底部订购条留出空间 */
	}

	.hotel-detail {
		width: 100%;
	}

	/* 住宿图片 */
	.hotel-image {
		width: 100%;
		height: 400rpx;
		position: relative;
	}

	.hotel-image image {
		width: 100%;
		height: 400rpx;
	}

	/* 住宿信息 */
	.hotel-info {
		background-color: #fff;
		margin-top: -20rpx;
		border-radius: 20rpx 20rpx 0 0;
		padding: 40rpx 30rpx;
	}

	.hotel-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 40rpx;
	}

	.hotel-title {
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

	/* 设施网格样式 */
	.facilities-grid {
		display: flex;
		flex-wrap: wrap;
		gap: 20rpx;
		margin-bottom: 30rpx;
	}

	.facility-item {
		background-color: #f8f9fa;
		border: 1px solid #e5e5e5;
		border-radius: 20rpx;
		padding: 15rpx 25rpx;
	}

	.facility-text {
		font-size: 26rpx;
		color: #36cfc9;
		font-weight: 500;
	}

	/* 详情样式 */
	.intro-details {
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

	/* 入住须知样式 */
	.rule-item {
		margin-bottom: 20rpx;
	}

	.rule-content {
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

	/* 尊享服务样式 */
	.service-item {
		margin-bottom: 30rpx;
		padding: 25rpx;
		background-color: #f8f9fa;
		border-radius: 12rpx;
		border-left: 6rpx solid #36cfc9;
	}

	.service-content {
		display: flex;
		flex-direction: column;
	}

	.service-title {
		font-size: 30rpx;
		color: #333;
		font-weight: 600;
		margin-bottom: 8rpx;
	}

	.service-desc {
		font-size: 26rpx;
		color: #666;
		line-height: 1.5;
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
	.bottom-booking-bar {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		display: flex;
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
		margin-right: 30rpx;
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

	.action-icons {
		display: flex;
		gap: 30rpx;
		margin-right: 30rpx;
	}

	.icon-item {
		width: 60rpx;
		height: 60rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: #f5f5f5;
		border-radius: 50%;
	}

	.action-icon {
		width: 36rpx;
		height: 36rpx;
	}

	.booking-btn {
		background-color: #36cfc9;
		color: #fff;
		border: none;
		border-radius: 50rpx;
		padding: 20rpx 40rpx;
		font-size: 28rpx;
		font-weight: 600;
		/* 按钮长宽比为158:36，移除购物车图标后可以稍微增加宽度 */
		width: 360rpx;
		height: 72rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.booking-btn:active {
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
</style>