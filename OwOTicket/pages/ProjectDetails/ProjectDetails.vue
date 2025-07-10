<template>
	<view class="container">
		<!-- 游乐项目详情页面 -->
		<view class="project-detail" v-if="projectInfo">
			<!-- 项目图片 -->
			<view class="project-image">
				<image :src="projectInfo.img" mode="aspectFill"></image>
			</view>

			<!-- 项目信息 -->
			<view class="project-info">
				<view class="project-header">
					<text class="project-title">{{ projectInfo.name }}</text>
					<!-- 喜欢数与标题对齐 -->
					<view class="like-section" @click="toggleLike">
						<image :src="isLiked ? '/static/images/like_selected.png' : '/static/images/like.png'" class="like-icon">
						</image>
						<text class="like-count">{{ projectInfo.like }}</text>
					</view>
				</view>

				<!-- Tab切换 -->
				<view class="tab-container">
					<view class="tab-header">
						<view class="tab-item" :class="{ active: activeTab === 'intro' }" @click="switchTab('intro')">
							<text>项目介绍</text>
						</view>
						<view class="tab-item" :class="{ active: activeTab === 'guide' }" @click="switchTab('guide')">
							<text>游玩攻略</text>
						</view>
						<view class="tab-item" :class="{ active: activeTab === 'notice' }" @click="switchTab('notice')">
							<text>购票须知</text>
						</view>
						<view class="tab-item" :class="{ active: activeTab === 'review' }" @click="switchTab('review')">
							<text>评价</text>
						</view>
						<!-- 滑动指示条 -->
						<view class="tab-indicator" :style="{ left: indicatorPosition }"></view>
					</view>

					<!-- Tab内容 -->
					<view class="tab-content">
						<!-- 项目介绍 -->
						<view v-if="activeTab === 'intro'" class="content-section">
							<text class="content-text">{{ projectInfo.introduction }}</text>
							<view class="intro-details">
								<view class="detail-item">
									<text class="detail-label">项目特色：</text>
									<text class="detail-value">{{ projectInfo.refer }}</text>
								</view>
								<view class="detail-item">
									<text class="detail-label">游玩时长：</text>
									<text class="detail-value">约10-15分钟</text>
								</view>
								<view class="detail-item">
									<text class="detail-label">开放时间：</text>
									<text class="detail-value">09:00-18:00</text>
								</view>
							</view>
						</view>

						<!-- 游玩攻略 -->
						<view v-if="activeTab === 'guide'" class="content-section">
							<view class="guide-item" v-for="(guideItem, index) in projectInfo.Guide" :key="index">
								<text class="guide-content">{{ guideItem }}</text>
							</view>
						</view>

						<!-- 购票须知 -->
						<view v-if="activeTab === 'notice'" class="content-section">
							<view class="notice-item">
								<text class="notice-title">购票说明</text>
								<text class="notice-content">• 门票当日有效，过期作废\n• 一人一票，凭票入场\n• 门票不可转让、不可退换</text>
							</view>
							<view class="notice-item">
								<text class="notice-title">入园须知</text>
								<text class="notice-content">• 请配合工作人员检票\n• 禁止携带危险物品入园\n• 请遵守园区各项规定</text>
							</view>
							<view class="notice-item">
								<text class="notice-title">安全提醒</text>
								<text class="notice-content">• 心脏病、高血压患者请谨慎游玩\n• 孕妇及身体不适者不建议游玩\n• 请听从工作人员指挥</text>
							</view>
						</view>

						<!-- 评价 -->
						<view v-if="activeTab === 'review'" class="content-section">
							<view class="review-summary">
								<text class="review-score">4.8</text>
								<text class="review-total">共1,256条评价</text>
							</view>
							<view class="review-item">
								<view class="review-header">
									<text class="reviewer-name">用户****123</text>
									<text class="review-date">2024-01-15</text>
								</view>
								<text class="review-content">非常刺激的项目！工作人员很专业，安全措施到位，强烈推荐！</text>
							</view>
							<view class="review-item">
								<view class="review-header">
									<text class="reviewer-name">用户****456</text>
									<text class="review-date">2024-01-12</text>
								</view>
								<text class="review-content">带孩子来玩的，孩子很喜欢，排队时间不长，体验很好。</text>
							</view>
							<view class="review-item">
								<view class="review-header">
									<text class="reviewer-name">用户****789</text>
									<text class="review-date">2024-01-10</text>
								</view>
								<text class="review-content">设施很新，维护得很好，值得一玩！</text>
							</view>
						</view>
					</view>
				</view>
			</view>
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
		AmusementProjects
	} from '../../static/data/CommonData.js'

	// 响应式数据
	const projectInfo = ref(null)
	const projectId = ref('')
	const isLiked = ref(false)
	const activeTab = ref('intro') // 当前激活的tab

	// 计算指示条位置 - 使用百分比避免固定值问题
	const indicatorPosition = computed(() => {
		const tabIndex = {
			'intro': 0,
			'guide': 1,
			'notice': 2,
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
			projectId.value = options.id
			loadProjectDetails(options.id)
		} else {
			uni.showToast({
				title: '参数错误',
				icon: 'none'
			})
		}
	})

	// 加载游乐项目详情
	function loadProjectDetails(id) {
		const project = AmusementProjects.find(item => item.id === id)

		if (project) {
			// 使用 markRaw 避免深度响应式，提高性能
			projectInfo.value = markRaw(project)
		} else {
			uni.showToast({
				title: '项目信息不存在',
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
			projectInfo.value.like = String(parseInt(projectInfo.value.like) - 1)
		} else {
			// 点赞
			isLiked.value = true
			projectInfo.value.like = String(parseInt(projectInfo.value.like) + 1)
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

	.project-detail {
		width: 100%;
	}

	/* 项目图片 */
	.project-image {
		width: 100%;
		height: 400rpx;
		position: relative;
	}

	.project-image image {
		width: 100%;
		height: 400rpx;
	}



	/* 项目信息 */
	.project-info {
		background-color: #fff;
		margin-top: -20rpx;
		border-radius: 20rpx 20rpx 0 0;
		padding: 40rpx 30rpx;
	}

	.project-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 40rpx;
	}

	.project-title {
		font-size: 48rpx;
		font-weight: 600;
		color: #333;
		flex: 1;
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

	/* 项目介绍样式 */
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

	/* 游玩攻略样式 */
	.guide-item {
		margin-bottom: 30rpx;
		padding: 25rpx;
		background-color: #f8f9fa;
		border-radius: 12rpx;
		border-left: 6rpx solid #36cfc9;
	}

	.guide-content {
		display: block;
		font-size: 28rpx;
		color: #333;
		line-height: 1.6;
		white-space: pre-line;
	}

	/* 购票须知样式 */
	.notice-item {
		margin-bottom: 40rpx;
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