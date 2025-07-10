<template>
	<view class="container">
		<!-- Tab切换头部 -->
		<view class="tab-header">
			<view class="tab-item" :class="{ active: activeTab === 'tickets' }" @click="switchTab('tickets')">
				<text>景区门票</text>
			</view>
			<view class="tab-item" :class="{ active: activeTab === 'amusement' }" @click="switchTab('amusement')">
				<text>游乐项目</text>
			</view>
		</view>

		<!-- Tab内容区域 -->
		<scroll-view scroll-y="true" class="tab-content">
			<!-- 景区门票内容 -->
			<view v-if="activeTab === 'tickets'">
				<!-- 使用common.css的票务样式 -->
				<view class="ticket_content">
					<view class="ticket_item" v-for="item in ticketList" :key="item.id" @click="goToTicketDetails(item)">
						<image :src="item.img" mode="aspectFill"></image>
						<text class="ticket_name">{{ item.name }}</text>
						<text class="ticket_price">￥{{ item.price < 10 ? '0' + item.price : item.price }}.00</text>
						<text class="ticket_refer">{{ item.refer }}</text>
					</view>
				</view>
			</view>

			<!-- 游乐项目内容 -->
			<view v-if="activeTab === 'amusement'">
				<!-- 游乐项目样式：name左下角，like右上角 -->
				<view class="amusement_content">
					<view class="amusement_item" v-for="item in amusementList" :key="item.id" @click="goToProjectDetails(item)">
						<image :src="item.img" mode="aspectFill"></image>
						<text class="amusement_name">{{ item.name }}</text>

						<text class="amusement_like">♥ {{ item.like }}</text>
					</view>
				</view>
			</view>
		</scroll-view>
	</view>
</template>

<script setup>
	import {
		ref
	} from 'vue'
	import {
		CommonTicketing,
		AmusementProjects
	} from '../../static/data/CommonData.js'

	// 响应式数据
	const activeTab = ref('tickets') // 当前激活的tab
	const ticketList = ref(CommonTicketing) // 门票列表
	const amusementList = ref(AmusementProjects) // 游乐项目列表
	const isNavigating = ref(false) // 防止重复跳转
	import {
		goToTicketDetails
	} from '../../utils/common.js'

	// 切换tab
	function switchTab(tab) {
		activeTab.value = tab
	}

	// 跳转到游乐项目详情页面
	function goToProjectDetails(project) {

		uni.navigateTo({
			url: `/pages/ProjectDetails/ProjectDetails?id=${project.id}`
		})
	}
</script>

<style scoped>
	@import "@/static/css/common.css";

	.container {
		width: 100%;
		height: 100vh;
		background-color: #fbfbfb;
		display: flex;
		flex-direction: column;
	}

	/* Tab头部样式 */
	.tab-header {
		display: flex;
		background-color: #fff;
		border-bottom: 1px solid #e5e5e5;
		position: sticky;
		top: 0;
		z-index: 100;
	}

	.tab-item {
		flex: 1;
		text-align: center;
		padding: 30rpx 0;
		position: relative;
	}

	.tab-item text {
		font-size: 32rpx;
		color: #666;
		font-weight: 500;
	}

	.tab-item.active text {
		color: #36cfc9;
		font-weight: 600;
	}

	.tab-item.active::after {
		content: '';
		position: absolute;
		bottom: 0;
		left: 50%;
		transform: translateX(-50%);
		width: 60rpx;
		height: 6rpx;
		background-color: #36cfc9;
		border-radius: 3rpx;
	}

	/* 内容区域样式 */
	.tab-content {
		flex: 1;
		padding: 20rpx 0 0 0;
	}



	/* 游乐项目样式 */
	.amusement_content {
		width: 96%;
		display: flex;
		flex-wrap: wrap;
		margin: 0 auto;
	}

	.amusement_item {
		width: 100%;
		height: 360rpx;
		margin: 0 10rpx 20rpx 10rpx;
		position: relative;
	}

	.amusement_item:last-child {
		margin-bottom: 20rpx;
	}

	.amusement_item image {
		width: 100%;
		height: 360rpx;
	}

	.amusement_item text {
		position: absolute;
		color: #fff;
		font-weight: 500;
	}

	.amusement_name {
		bottom: 30rpx;
		left: 30rpx;
		font-size: 20px;
	}



	.amusement_like {
		top: 30rpx;
		right: 20rpx;
		font-size: 16px;
	}
</style>