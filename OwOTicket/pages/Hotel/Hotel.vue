<template>
	<view class="hotel_body">
		<!-- 顶部筛选组件 -->
		<view class="top-filter">
			<view class="filter-tabs">
				<view class="tab-button" :class="{ active: activeTab === 'hot' }" @click="switchTab('hot')">
					<text class="tab-text">最热</text>
				</view>
				<view class="tab-button" :class="{ active: activeTab === 'new' }" @click="switchTab('new')">
					<text class="tab-text">最新</text>
				</view>
			</view>
			<view class="total-count">
				<text class="count-text">共</text>
				<text class="count-number">{{ totalCount }}</text>
				<text class="count-text">种住宿产品</text>
			</view>
		</view>

		<!-- 精选住宿 -->
		<view class="hotel_content">
			<view class="hotel_item" v-for="item in CommonHotel" :key="item.id" @click="goToHotelDetails(item)">
				<image :src="item.img" mode=""></image>
				<view class="hotel_name">
					{{ item.name }}
					<text>￥{{ item.price < 10 ? '0' + item.price : item.price }}.00</text>
				</view>
				<text class="hotel_refer">{{ item.refer }}</text>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref, computed } from 'vue'
import {
	CommonHotel
} from '../../static/data/CommonData.js'
import {
	goToHotelDetails
} from '../../utils/common.js'

// 响应式数据
const activeTab = ref('hot') // 当前激活的tab，默认为"最热"

// 计算总数量
const totalCount = computed(() => {
	return CommonHotel.length
})

// 切换tab
function switchTab(tab) {
	activeTab.value = tab
}
</script>

<style scoped>
@import "@/static/css/common.css";

.hotel_body {
	background-color: #f5f5f5;
}

/* 顶部筛选组件样式 */
.top-filter {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 30rpx;
	background-color: #ffffff;
	margin-bottom: 20rpx;
}

.filter-tabs {
	display: flex;
	gap: 20rpx;
}

.tab-button {
	/* 长宽比76:32 */
	width: 152rpx;
	height: 64rpx;
	border-radius: 32rpx;
	/* 圆角为宽度的一半 */
	background-color: #f5f5f5;
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
	transition: all 0.3s ease;
}

.tab-button.active {
	background-color: #36cfc9;
}

.tab-text {
	font-size: 26rpx;
	color: #666;
	font-weight: 500;
}

.tab-button.active .tab-text {
	color: #ffffff;
	font-weight: 600;
}

.total-count {
	display: flex;
	align-items: center;
}

.count-text {
	font-size: 28rpx;
	color: #c3c3c3;
	font-weight: 500;
}

.count-number {
	font-size: 28rpx;
	color: #36cfc9;
	font-weight: 600;
	margin: 0 4rpx;
}
</style>