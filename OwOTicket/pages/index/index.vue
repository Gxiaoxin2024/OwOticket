<template>
	<view class="body">
		<scroll-view scroll-y="true">
			<!-- 轮播图 -->
			<swiper :indicator-dots="true" :autoplay="true" :interval="2000" :duration="1000">
				<swiper-item>
					<view class="swiper_item">
						<image src="../../static/images/551.jpg" alt="" />
					</view>
				</swiper-item>
				<swiper-item>
					<view class="swiper_item">
						<image src="../../static/images/554.jpg" alt="" />
					</view>
				</swiper-item>
				<swiper-item>
					<view class="swiper_item">
						<image src="../../static/images/661.jpg" alt="" />
					</view>
				</swiper-item>
			</swiper>

			<!-- 图标导航栏 -->
			<view class="nav">
				<view class="nav_item" @click="goTicketing">
					<image src="../../static/images/ticket.png" alt="" />
					<text>票务</text>
				</view>
				<view class="nav_item" @click="goHotel">
					<image src="../../static/images/stay.png" alt="" />
					<text>住宿</text>
				</view>
				<view class="nav_item" @click="goSouvenir">
					<image src="../../static/images/souvenir.png" alt="" />
					<text>纪念品</text>
				</view>
			</view>

			<!-- 常用票务 -->
			<view class="ticket">
				<!-- 常用票务头部导航 -->
				<view class="ticket_title">
					<text>常用票务</text>
					<text class="more" @click="goTicketing">更多</text>
				</view>
				<!-- 常用票务内容 -->
				<view class="ticket_content">
					<view class="ticket_item" v-for="item in homeTicket" :key="item.id" @click="goToTicketDetails(item)">
						<image :src="item.img" mode=""></image>
						<text class="ticket_name">{{ item.name }}</text>
						<text class="ticket_price">￥{{ item.price < 10 ? '0' + item.price : item.price }}.00</text>
						<text class="ticket_refer">{{ item.refer }}</text>
					</view>
				</view>
			</view>

			<!-- 精选住宿 -->
			<!-- 精选住宿头部导航 -->
			<view class="ticket_title">
				<text>精选住宿</text>
				<text class="more" @click="goHotel">更多</text>
			</view>
			<!-- 精选住宿内容 -->
			<view class="hotel_content">
				<view class="hotel_item" v-for="item in homeHotel" :key="item.id" @click="goToHotelDetails(item)">
					<image :src="item.img" mode=""></image>
					<view class="hotel_name">
						{{ item.name }}
						<text>￥{{ item.price < 10 ? '0' + item.price : item.price }}.00</text>
					</view>
					<text class="hotel_refer">{{ item.refer }}</text>
				</view>
			</view>

			<!-- 热销纪念品 -->
			<!-- 热销纪念品头部导航栏 -->
			<view class="ticket_title">
				<text>热销纪念品</text>
				<text class="more" @click="goSouvenir">更多</text>
			</view>
			<!-- 热销纪念品内容 -->
			<view class="souvenir_content">
				<view class="souvenir_item" v-for="item in homeSouvenir" :key="item.id" @click="goToSouvenirDetails(item)">
					<image :src="item.img" mode=""></image>
					<text style="margin-left: 20rpx;">{{ item.name }}</text>
					<view class="souvenir_name">
						<text>￥{{ item.price < 10 ? '0' + item.price : item.price }}.00</text> 已售{{ item.sale }}
					</view>
				</view>
			</view>
		</scroll-view>
	</view>
</template>

<script setup>
	import {
		CommonTicketing,
		CommonHotel,
		CommonSouvenir
	} from '../../static/data/CommonData.js'
	import {
		goToTicketDetails,
		goToHotelDetails,
		goToSouvenirDetails
	} from '../../utils/common.js'


	// 数据渲染
	const homeTicket = [CommonTicketing[0], CommonTicketing[1]];
	const homeHotel = [CommonHotel[0], CommonHotel[2]];
	const homeSouvenir = [CommonSouvenir[0], CommonSouvenir[1]];
	// 页面跳转门票
	function goTicketing() {
		uni.navigateTo({
			url: '/pages/Ticketing/Ticketing'
		})
	}
	// 页面跳转住宿
	function goHotel() {
		uni.navigateTo({
			url: '/pages/Hotel/Hotel'
		})
	}
	// 页面跳转纪念品
	function goSouvenir() {
		uni.navigateTo({
			url: '/pages/Souvenir/Souvenir'
		})
	}
</script>

<style scoped>
	@import "@/static/css/common.css";

	/* 页面主体样式 */
	.body {
		width: 100%;
		background-color: #fbfbfb;
	}

	/* 轮播图样式 */
	swiper {
		height: 400rpx;
	}

	.swiper_item image {
		width: 100%;
		height: 400rpx;
	}

	/* 图标导航栏样式 */
	.nav {
		display: flex;
		justify-content: space-around;
		align-items: center;
		background-color: #fff;
		padding: 20rpx 0;
	}

	.nav_item {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.nav_item image {
		width: 100rpx;
		height: 100rpx;
	}

	.nav_item text {
		font-size: 12px;
		margin-top: 10rpx;
	}

	/* 常用票务 */
	.ticket_title {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 20rpx;
		font-size: 18px;
	}

	.ticket_title .more {
		font-size: 14px;
		color: #999;
	}
</style>