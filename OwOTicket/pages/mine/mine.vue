<template>
	<view class="container" :class="{ 'fade-in': isPageLoaded }">
		<!-- 个人中心页面 -->

		<!-- 顶部用户信息区域 -->
		<view class="user-header" :class="{ 'slide-in-top': isPageLoaded }">
			<view class="user-info">
				<image :src="userInfo.img || '/static/images/DefaultAvatar.png'" class="user-avatar" mode="aspectFill"></image>
				<view class="user-details">
					<view class="user-name-row">
						<text class="user-name">{{ userInfo.name || '未登录用户' }}</text>
						<view class="edit-btn" v-if="isLoggedIn" @click="goToEditProfile">
							<text class="edit-text">🔧编辑</text>
						</view>
					</view>
					<view class="club-badge" v-if="isLoggedIn">
						<text class="club-text">已加入OwO俱乐部 {{ userInfo.clubDays || 0 }} 天</text>
					</view>
					<view class="login-prompt" v-else @click="goToLogin">
						<text class="login-text">点击登录</text>
					</view>
				</view>
			</view>
		</view>

		<!-- 账号信息区域 -->
		<view class="account-stats" :class="{ 'slide-in-left': isPageLoaded }">
			<view class="stat-item" @click="goToPoints">
				<text class="stat-number">{{ userInfo.points }}</text>
				<text class="stat-label">积分</text>
			</view>
			<view class="stat-item" @click="goToLikes">
				<text class="stat-number">{{ userInfo.likes }}</text>
				<text class="stat-label">喜欢</text>
			</view>
			<view class="stat-item" @click="goToCoupons">
				<text class="stat-number">{{ userInfo.coupons }}</text>
				<text class="stat-label">优惠券</text>
			</view>
			<view class="stat-item" @click="goToFootprints">
				<text class="stat-number">{{ userInfo.footprints }}</text>
				<text class="stat-label">足迹</text>
			</view>
		</view>

		<!-- 我的订单组件 -->
		<view class="order-section" :class="{ 'slide-in-right': isPageLoaded }">
			<view class="section-header">
				<text class="section-title">我的订单</text>
				<text class="section-more" @click="goToAllOrders">查看全部订单 ></text>
			</view>
			<view class="order-types">
				<view class="order-type-item" @click="goToOrders('payment')">
					<image src="/static/images/mine_payment.png" class="order-icon"></image>
					<text class="order-label">待付款</text>
					<view class="order-badge" v-if="orderCounts.payment > 0">
						<text class="badge-text">{{ orderCounts.payment }}</text>
					</view>
				</view>
				<view class="order-type-item" @click="goToOrders('consumption')">
					<image src="/static/images/mine_consumption.png" class="order-icon"></image>
					<text class="order-label">待消费</text>
					<view class="order-badge" v-if="orderCounts.consumption > 0">
						<text class="badge-text">{{ orderCounts.consumption }}</text>
					</view>
				</view>
				<view class="order-type-item" @click="goToOrders('assess')">
					<image src="/static/images/mine_assess.png" class="order-icon"></image>
					<text class="order-label">待评价</text>
					<view class="order-badge" v-if="orderCounts.assess > 0">
						<text class="badge-text">{{ orderCounts.assess }}</text>
					</view>
				</view>
				<view class="order-type-item" @click="goToOrders('refund')">
					<image src="/static/images/mine_refund.png" class="order-icon"></image>
					<text class="order-label">退款/售后</text>
					<view class="order-badge" v-if="orderCounts.refund > 0">
						<text class="badge-text">{{ orderCounts.refund }}</text>
					</view>
				</view>
			</view>
		</view>

		<!-- 其他功能组件（预留） -->
		<view class="other-section" :class="{ 'slide-in-bottom': isPageLoaded }">
			<view class="section-header">
				<text class="section-title">更多服务</text>
			</view>
			<view class="service-list">
				<!-- 管理页面 - 双重检查确保显示稳定 -->
				<view class="service-item" v-if="isAdmin && checkCurrentUserAdmin()" @click="goToManagePage">
					<text class="service-label admin-label">管理页面</text>
					<text class="service-arrow">></text>
				</view>

				<view class="service-item" @click="goToCustomerService">
					<text class="service-label">客服中心</text>
					<text class="service-arrow">></text>
				</view>
				<view class="service-item" @click="goToSettings">
					<text class="service-label">设置</text>
					<text class="service-arrow">></text>
				</view>
				<view class="service-item" @click="goToAbout">
					<text class="service-label">关于我们</text>
					<text class="service-arrow">></text>
				</view>
			</view>
		</view>

		<!-- 退出登录按钮 -->
		<view class="logout-section" v-if="isLoggedIn">
			<button class="logout-btn" @click="handleLogout">退出登录</button>
		</view>
	</view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import orderService from '../../utils/orderUtils.js'

// 响应式数据
const userInfo = ref({
	name: '未登录用户',
	img: '/static/images/DefaultAvatar.png',
	clubDays: 0,
	points: 0,
	likes: 0,
	coupons: 0,
	footprints: 0
})

const orderCounts = ref({
	payment: 0,
	consumption: 0,
	assess: 0,
	refund: 0
})

// 响应式登录状态
const isLoggedIn = ref(false)

// 检查是否为管理员
const isAdmin = ref(false)

// 页面加载状态（用于动画控制）
const isPageLoaded = ref(false)

// 检查登录状态
function checkLoginStatus() {
	try {
		const token = uni.getStorageSync('token')
		isLoggedIn.value = !!(token && token.trim() !== '')

		// 检查是否为管理员 - 优化逻辑确保稳定性
		checkAdminStatus()

		return isLoggedIn.value
	} catch (e) {
		console.error('检查登录状态失败:', e)
		isLoggedIn.value = false
		isAdmin.value = false
		return false
	}
}

// 独立的管理员权限检查函数
function checkAdminStatus() {
	try {
		// 无论是否登录都检查管理员状态，确保状态准确
		const currentUserStr = uni.getStorageSync('currentUser')
		if (currentUserStr) {
			const currentUser = JSON.parse(currentUserStr)
			// 根据isAdmin字段判断管理员权限（1为管理员，0不是管理员）
			// 同时兼容布尔值和数字值
			isAdmin.value = currentUser.isAdmin === 1 || currentUser.isAdmin === true
		} else {
			isAdmin.value = false
			console.log('未找到currentUser，设置isAdmin为false')
		}
	} catch (e) {
		console.error('检查管理员状态失败:', e)
		isAdmin.value = false
	}
}

// 获取当前用户信息
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



// 获取订单统计数据
async function loadOrderCounts() {
	const currentUser = getCurrentUser()
	if (!currentUser) {
		// 未登录用户，重置订单统计
		orderCounts.value = {
			payment: 0,
			consumption: 0,
			assess: 0,
			refund: 0
		}
		return
	}

	try {
		// 从后端获取用户订单数据
		const orders = await orderService.getUserOrders(currentUser.account)

		// 统计不同状态的订单数量
		let paymentCount = 0      // status = 0 待付款
		let consumptionCount = 0  // status = 1 待消费
		let assessCount = 0       // status = 2 待评价
		let refundCount = 0       // 退款/售后 (暂时为0，功能未开发)

		// 遍历所有订单项进行统计
		orders.forEach(order => {
			if (order.items && Array.isArray(order.items)) {
				order.items.forEach(item => {
					// 确保status是数字类型
					const status = parseInt(item.status)
					switch (status) {
						case 0:
							paymentCount++
							break
						case 1:
							consumptionCount++
							break
						case 2:
							assessCount++
							break
						default:
							break
					}
				})
			}
		})

		// 更新订单统计数据
		orderCounts.value = {
			payment: paymentCount,
			consumption: consumptionCount,
			assess: assessCount,
			refund: refundCount
		}

	} catch (error) {
		console.error('获取订单统计失败:', error)
		// 获取失败时重置为0
		orderCounts.value = {
			payment: 0,
			consumption: 0,
			assess: 0,
			refund: 0
		}
	}
}

// 触发页面动画
function triggerPageAnimation() {
	// 先重置动画状态
	isPageLoaded.value = false

	// 延迟触发渐入动画，确保页面内容已渲染
	setTimeout(() => {
		isPageLoaded.value = true
	}, 50)
}

// 页面加载时初始化数据
onMounted(() => {
	loadUserData()
	triggerPageAnimation()
})

// 页面显示时刷新数据和动画
onShow(() => {
	// 重新检查登录状态和管理员权限
	checkLoginStatus()
	// 单独再次检查管理员权限，确保显示正确
	checkAdminStatus()
	// 重新加载用户数据
	loadUserData()
	// 每次显示页面时都触发动画
	triggerPageAnimation()
})

// 加载用户数据
function loadUserData() {
	try {
		// 首先检查登录状态
		const loginStatus = checkLoginStatus()

		if (loginStatus) {
			// 从本地存储获取当前用户信息
			const currentUserStr = uni.getStorageSync('currentUser')
			if (currentUserStr) {
				const currentUser = JSON.parse(currentUserStr)

				// 检查用户数据是否在users列表中被更新了
				const updatedUser = syncUserDataFromStorage(currentUser)

				userInfo.value = {
					name: updatedUser.name || 'OwO用户',
					img: updatedUser.img || '/static/images/DefaultAvatar.png',
					clubDays: updatedUser.clubDays || 0,
					points: updatedUser.points || 0,
					likes: updatedUser.likes || 0,
					coupons: updatedUser.coupons || 0,
					footprints: updatedUser.footprints || 0
				}

				// 数据同步后重新检查管理员权限，确保权限状态正确
				checkAdminStatus()

				// 加载真实的订单统计数据
				loadOrderCounts()
			}
		} else {
			// 未登录状态，重置为默认数据
			userInfo.value = {
				name: '未登录用户',
				img: '/static/images/DefaultAvatar.png',
				clubDays: 0,
				points: 0,
				likes: 0,
				coupons: 0,
				footprints: 0
			}
			orderCounts.value = {
				payment: 0,
				consumption: 0,
				assess: 0,
				refund: 0
			}
		}
	} catch (error) {
		console.error('加载用户数据失败:', error)
		// 出错时使用默认数据并设置为未登录状态
		isLoggedIn.value = false
		isAdmin.value = false
		userInfo.value = {
			name: '未登录用户',
			img: '/static/images/DefaultAvatar.png',
			clubDays: 0,
			points: 0,
			likes: 0,
			coupons: 0,
			footprints: 0
		}
		orderCounts.value = {
			payment: 0,
			consumption: 0,
			assess: 0,
			refund: 0
		}
	}
}

// 从存储中同步用户数据
function syncUserDataFromStorage(currentUser) {
	try {
		// 获取最新的用户列表
		const usersStr = uni.getStorageSync('users')
		if (usersStr) {
			const users = JSON.parse(usersStr)
			// 根据账号或ID查找最新的用户数据
			const latestUser = users.find(user =>
				user.account === currentUser.account || user.id === currentUser.id
			)

			if (latestUser) {
				// 检查用户数据是否发生变化，特别是isAdmin字段
				const hasAdminChanged = latestUser.isAdmin !== currentUser.isAdmin

				// 更新currentUser存储
				uni.setStorageSync('currentUser', JSON.stringify(latestUser))

				// 如果管理员权限发生变化，立即更新状态
				if (hasAdminChanged) {
					console.log('检测到管理员权限变化，重新检查权限状态')
					checkAdminStatus()
				}

				return latestUser
			}
		}

		// 如果没找到，返回原用户数据
		return currentUser
	} catch (error) {
		console.error('同步用户数据失败:', error)
		return currentUser
	}
}

// 跳转到积分页面
function goToPoints() {
	uni.showToast({
		title: '积分功能开发中',
		icon: 'none'
	})
}

// 跳转到喜欢页面
function goToLikes() {
	uni.showToast({
		title: '喜欢功能开发中',
		icon: 'none'
	})
}

// 跳转到优惠券页面
function goToCoupons() {
	uni.showToast({
		title: '优惠券功能开发中',
		icon: 'none'
	})
}

// 跳转到足迹页面
function goToFootprints() {
	uni.showToast({
		title: '足迹功能开发中',
		icon: 'none'
	})
}

// 统一的订单页面跳转方法
function goToOrders(type) {
	if (type === 'refund') {
		// 退款/售后功能暂未开发
		uni.showToast({
			title: '退款/售后功能开发中',
			icon: 'none'
		})
		return
	}

	// 根据类型确定跳转参数
	let tabParam = 'all' // 默认跳转到全部
	switch (type) {
		case 'all':
			tabParam = 'all' // 全部订单
			break
		case 'payment':
			tabParam = '0' // 待付款（原索引0，现在对应新的索引1）
			break
		case 'consumption':
			tabParam = '1' // 待消费（原索引1，现在对应新的索引2）
			break
		case 'assess':
			tabParam = '2' // 评价（原索引2，现在对应新的索引3）
			break
		default:
			tabParam = 'all'
	}

	uni.navigateTo({
		url: `/pages/OrderPage/OrderPage?tab=${tabParam}`
	})
}

// 跳转到全部订单页面（保持向后兼容）
function goToAllOrders() {
	goToOrders('all')
}

// 跳转到客服中心
function goToCustomerService() {
	uni.showToast({
		title: '客服中心功能开发中',
		icon: 'none'
	})
}

// 跳转到设置页面
function goToSettings() {
	uni.navigateTo({
		url: '/pages/Settings/Settings'
	})
}

// 跳转到关于我们页面
function goToAbout() {
	uni.navigateTo({
		url: '/pages/AboutUs/AboutUs'
	})
}



// 跳转到登录页面
function goToLogin() {
	uni.navigateTo({
		url: '/pages/LoginPage/LoginPage'
	})
}

// 跳转到用户编辑页面
function goToEditProfile() {
	uni.navigateTo({
		url: '/pages/EditProfile/EditProfile'
	})
}

// 实时检查当前用户是否为管理员（用于模板双重验证）
function checkCurrentUserAdmin() {
	try {
		const currentUserStr = uni.getStorageSync('currentUser')
		if (currentUserStr) {
			const currentUser = JSON.parse(currentUserStr)
			return currentUser.isAdmin === 1 || currentUser.isAdmin === true
		}
		return false
	} catch (e) {
		console.error('实时检查管理员状态失败:', e)
		return false
	}
}

// 跳转到管理页面
function goToManagePage() {
	// 跳转前再次确认管理员权限
	if (!checkCurrentUserAdmin()) {
		uni.showToast({
			title: '权限不足',
			icon: 'none'
		})
		return
	}

	uni.navigateTo({
		url: '/pages/managePage/managePage'
	})
}

// 处理退出登录
function handleLogout() {
	uni.showModal({
		title: '确认退出',
		content: '确定要退出登录吗？',
		success: (res) => {
			if (res.confirm) {
				logout()
			}
		}
	})
}

// 退出登录
function logout() {
	try {
		// 清除本地存储的登录信息
		uni.removeStorageSync('token')
		uni.removeStorageSync('currentUser')

		// 立即更新登录状态
		isLoggedIn.value = false
		isAdmin.value = false

		// 立即更新用户数据为未登录状态
		userInfo.value = {
			name: '未登录用户',
			img: '/static/images/DefaultAvatar.png',
			clubDays: 0,
			points: 0,
			likes: 0,
			coupons: 0,
			footprints: 0
		}

		// 重置订单数据
		orderCounts.value = {
			payment: 0,
			consumption: 0,
			assess: 0,
			refund: 0
		}

		// 显示退出成功提示
		uni.showToast({
			title: '已退出登录',
			icon: 'success',
			duration: 1500
		})

	} catch (error) {
		console.error('退出登录失败:', error)
		uni.showToast({
			title: '退出失败，请重试',
			icon: 'none'
		})
	}
}
</script>

<style scoped>
page {
	background-color: #f5f5f5;
}

.container {
	width: 100%;
	/* min-height: 89vh; */
	background: linear-gradient(to bottom, #36cfc9 0%, #36cfc9 40%, #f5f5f5 45%, #f5f5f5 100%);
	/* 初始状态：透明且稍微向下偏移 */
	opacity: 0;
	transform: translateY(30rpx);
	transition: opacity 0.4s ease-out, transform 0.4s ease-out;
}

/* 渐入动画：页面加载完成后的状态 */
.container.fade-in {
	opacity: 1;
	transform: translateY(0);
}

/* 分层动画效果 */
/* 顶部用户信息区域 - 从上方滑入 */
.user-header {
	opacity: 0;
	transform: translateY(-50rpx);
	transition: opacity 0.5s ease-out 0.1s, transform 0.5s ease-out 0.1s;
}

.user-header.slide-in-top {
	opacity: 1;
	transform: translateY(0);
}

/* 账号信息区域 - 从左侧滑入 */
.account-stats {
	opacity: 0;
	transform: translateX(-50rpx);
	transition: opacity 0.5s ease-out 0.25s, transform 0.5s ease-out 0.25s;
}

.account-stats.slide-in-left {
	opacity: 1;
	transform: translateX(0);
}

/* 订单区域 - 从右侧滑入 */
.order-section {
	opacity: 0;
	transform: translateX(50rpx);
	transition: opacity 0.5s ease-out 0.4s, transform 0.5s ease-out 0.4s;
}

.order-section.slide-in-right {
	opacity: 1;
	transform: translateX(0);
}

/* 其他功能区域 - 从下方滑入 */
.other-section {
	opacity: 0;
	transform: translateY(50rpx);
	transition: opacity 0.5s ease-out 0.55s, transform 0.5s ease-out 0.55s;
}

.other-section.slide-in-bottom {
	opacity: 1;
	transform: translateY(0);
}

/* 顶部用户信息区域 */
.user-header {
	padding: 60rpx 30rpx 40rpx;
	background-color: transparent;
}

.user-info {
	display: flex;
	align-items: center;
}

.user-avatar {
	width: 120rpx;
	height: 120rpx;
	border-radius: 60rpx;
	margin-right: 30rpx;
	border: 4rpx solid rgba(255, 255, 255, 0.3);
}

.user-details {
	flex: 1;
}

.user-name-row {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 15rpx;
}

.user-name {
	font-size: 36rpx;
	font-weight: 600;
	color: #ffffff;
	flex: 1;
}

.edit-btn {
	background-color: rgba(255, 255, 255, 0.2);
	border-radius: 20rpx;
	padding: 8rpx 16rpx;
	cursor: pointer;
	transition: all 0.3s;
}

.edit-btn:hover {
	background-color: rgba(255, 255, 255, 0.3);
}

.edit-text {
	color: #ffffff;
}

.club-badge {
	background-color: #d3e1bd;
	border-radius: 30rpx;
	padding: 6rpx 20rpx;
	/* 长椭圆形171:24的比例 */
	width: 342rpx;
	height: 48rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.club-text {
	font-size: 24rpx;
	color: #333;
	font-weight: 500;
}

/* 登录提示样式 */
.login-prompt {
	background-color: rgba(255, 255, 255, 0.2);
	border: 1rpx solid rgba(255, 255, 255, 0.3);
	border-radius: 24rpx;
	padding: 6rpx 20rpx;
	width: 160rpx;
	height: 48rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
	transition: all 0.3s ease;
}

.login-prompt:active {
	background-color: rgba(255, 255, 255, 0.3);
	transform: scale(0.95);
}

.login-text {
	font-size: 24rpx;
	color: #ffffff;
	font-weight: 500;
}

/* 账号信息区域 */
.account-stats {
	display: flex;
	justify-content: space-around;
	padding: 30rpx;
	margin: 0 30rpx 30rpx;
	background-color: #ffffff;
	border-radius: 20rpx;
	box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
}

.stat-item {
	display: flex;
	flex-direction: column;
	align-items: center;
	cursor: pointer;
}

.stat-number {
	font-size: 32rpx;
	font-weight: 700;
	color: #333;
	margin-bottom: 8rpx;
}

.stat-label {
	font-size: 24rpx;
	color: #666;
	font-weight: 500;
}

/* 我的订单组件 */
.order-section {
	margin: 0 30rpx 30rpx;
	background-color: #ffffff;
	border-radius: 20rpx;
	padding: 30rpx;
	box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
}

.section-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 30rpx;
}

.section-title {
	font-size: 32rpx;
	font-weight: 600;
	color: #333;
}

.section-more {
	font-size: 26rpx;
	color: #36cfc9;
	cursor: pointer;
}

.order-types {
	display: flex;
	justify-content: space-around;
}

.order-type-item {
	display: flex;
	flex-direction: column;
	align-items: center;
	position: relative;
	cursor: pointer;
}

.order-icon {
	width: 60rpx;
	height: 60rpx;
	margin-bottom: 15rpx;
}

.order-label {
	font-size: 24rpx;
	color: #666;
	font-weight: 500;
}

.order-badge {
	position: absolute;
	top: -8rpx;
	right: -8rpx;
	background-color: #ff4757;
	border-radius: 20rpx;
	min-width: 32rpx;
	height: 32rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 0 8rpx;
}

.badge-text {
	font-size: 20rpx;
	color: #ffffff;
	font-weight: 600;
}

/* 其他功能组件 */
.other-section {
	margin: 0 30rpx 30rpx;
	background-color: #ffffff;
	border-radius: 20rpx;
	padding: 30rpx;
	box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
}

.service-list {
	margin-top: 20rpx;
}

.service-item {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 25rpx 0;
	border-bottom: 1px solid #f0f0f0;
	cursor: pointer;
}

.service-item:last-child {
	border-bottom: none;
}

.service-label {
	font-size: 28rpx;
	color: #333;
	font-weight: 500;
}

.admin-label {
	color: #36cfc9;
	font-weight: 600;
}

.service-arrow {
	font-size: 24rpx;
	color: #999;
}

/* 退出登录按钮 */
.logout-section {
	margin: 20rpx 30rpx;
}

.logout-btn {
	width: 100%;
	height: 88rpx;
	background-color: #ff4757;
	color: #ffffff;
	border: none;
	border-radius: 12rpx;
	font-size: 32rpx;
	font-weight: 600;
	display: flex;
	align-items: center;
	justify-content: center;
	transition: all 0.3s ease;
}

.logout-btn:active {
	background-color: #ff3742;
	transform: scale(0.98);
}

.logout-btn::after {
	border: none;
}
</style>