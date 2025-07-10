<template>
	<view class="container">
		<!-- 头部管理按钮 -->
		<view class="header">
			<text class="manage-btn" style="color: #36cfc9 ;">OwO购物车</text>
			<text class="manage-btn" @click="toggleManageMode">{{ isManageMode ? '完成' : '管理' }}</text>
		</view>

		<!-- 购物车内容 -->
		<scroll-view scroll-y="true" class="cart-content">
			<!-- 票务组件 -->
			<view class="cart-section" v-if="cartData.Ticketing && cartData.Ticketing.length > 0">
				<view class="section-header">
					<checkbox-group @change="onSectionCheck('Ticketing', $event)">
						<label class="section-checkbox">
							<checkbox :value="'Ticketing'" :checked="sectionChecked.Ticketing" />
						</label>
					</checkbox-group>
					<text class="section-title">票务</text>
				</view>
				<view class="item-list">
					<view class="cart-item" v-for="item in cartData.Ticketing" :key="item.card_id || item.id">
						<checkbox-group @change="onItemCheck('Ticketing', item.card_id || item.id, $event)">
							<label class="item-checkbox">
								<checkbox :value="item.card_id || item.id"
									:checked="isItemChecked('Ticketing', item.card_id || item.id)" />
							</label>
						</checkbox-group>
						<image :src="item.img" class="item-image" mode="aspectFill"></image>
						<view class="item-info">
							<text class="item-name">{{ item.type }}</text>
							<view class="item-detail">
								<text class="detail-label">预定时间：</text>
								<text class="detail-time">{{ item.scheduledTime }}</text>
							</view>
							<text class="item-price">￥{{ parseFloat(item.price).toFixed(2) }}</text>
						</view>
						<view class="quantity-control">
							<button class="quantity-btn" @click="decreaseQuantity('Ticketing', item.card_id || item.id)">-</button>
							<text class="quantity-text">{{ item.count }}</text>
							<button class="quantity-btn" @click="increaseQuantity('Ticketing', item.card_id || item.id)">+</button>
						</view>
					</view>
				</view>
			</view>

			<!-- 住宿组件 -->
			<view class="cart-section" v-if="cartData.Hotel && cartData.Hotel.length > 0">
				<view class="section-header">
					<checkbox-group @change="onSectionCheck('Hotel', $event)">
						<label class="section-checkbox">
							<checkbox :value="'Hotel'" :checked="sectionChecked.Hotel" />
						</label>
					</checkbox-group>
					<text class="section-title">住宿</text>
				</view>
				<view class="item-list">
					<view class="cart-item" v-for="item in cartData.Hotel" :key="item.card_id || item.id">
						<checkbox-group @change="onItemCheck('Hotel', item.card_id || item.id, $event)">
							<label class="item-checkbox">
								<checkbox :value="item.card_id || item.id" :checked="isItemChecked('Hotel', item.card_id || item.id)" />
							</label>
						</checkbox-group>
						<image :src="item.img" class="item-image" mode="aspectFill"></image>
						<view class="item-info">
							<text class="item-name">{{ item.type }}</text>
							<view class="item-detail">
								<text class="detail-label">预定时间：</text>
								<text class="detail-time">{{ item.scheduledTime }}</text>
							</view>
							<text class="item-price">￥{{ parseFloat(item.price).toFixed(2) }}</text>
						</view>
						<view class="quantity-control">
							<button class="quantity-btn" @click="decreaseQuantity('Hotel', item.card_id || item.id)">-</button>
							<text class="quantity-text">{{ item.count }}</text>
							<button class="quantity-btn" @click="increaseQuantity('Hotel', item.card_id || item.id)">+</button>
						</view>
					</view>
				</view>
			</view>

			<!-- 纪念品组件 -->
			<view class="cart-section" v-if="cartData.Souvenir && cartData.Souvenir.length > 0">
				<view class="section-header">
					<checkbox-group @change="onSectionCheck('Souvenir', $event)">
						<label class="section-checkbox">
							<checkbox :value="'Souvenir'" :checked="sectionChecked.Souvenir" />
						</label>
					</checkbox-group>
					<text class="section-title">纪念品</text>
				</view>
				<view class="item-list">
					<view class="cart-item" v-for="item in cartData.Souvenir" :key="item.card_id || item.id">
						<checkbox-group @change="onItemCheck('Souvenir', item.card_id || item.id, $event)">
							<label class="item-checkbox">
								<checkbox :value="item.card_id || item.id"
									:checked="isItemChecked('Souvenir', item.card_id || item.id)" />
							</label>
						</checkbox-group>
						<image :src="item.img" class="item-image" mode="aspectFill"></image>
						<view class="item-info">
							<text class="item-name">{{ item.type }}</text>
							<text class="item-detail" v-if="item.model">型号：{{ item.model.size }} {{ item.model.color }}</text>
							<text class="item-price">￥{{ parseFloat(item.price).toFixed(2) }}</text>
						</view>
						<view class="quantity-control">
							<button class="quantity-btn" @click="decreaseQuantity('Souvenir', item.card_id || item.id)">-</button>
							<text class="quantity-text">{{ item.count }}</text>
							<button class="quantity-btn" @click="increaseQuantity('Souvenir', item.card_id || item.id)">+</button>
						</view>
					</view>
				</view>
			</view>

			<!-- 空购物车状态 -->
			<view v-if="isCartEmpty" class="empty-cart">
				<text class="empty-text">购物车是空的</text>
				<text class="empty-subtitle">快去添加一些商品吧！</text>
			</view>
		</scroll-view>

		<!-- 底部控制栏 -->
		<view class="bottom-bar" v-if="!isCartEmpty">
			<!-- 普通模式 -->
			<template v-if="!isManageMode">
				<view class="select-all">
					<checkbox-group @change="onSelectAll">
						<label class="select-all-checkbox">
							<checkbox value="all" :checked="isAllSelected" />
							<text>全选</text>
						</label>
					</checkbox-group>
				</view>
				<view class="total-section">
					<text class="total-text">合计：</text>
					<text class="total-price">￥{{ totalPrice }}</text>
				</view>
				<button class="checkout-btn" @click="checkout" :disabled="selectedCount === 0">
					结算({{ selectedCount }})
				</button>
			</template>

			<!-- 管理模式 -->
			<template v-else>
				<view class="select-all">
					<checkbox-group @change="onSelectAll">
						<label class="select-all-checkbox">
							<checkbox value="all" :checked="isAllSelected" />
							<text>全选</text>
						</label>
					</checkbox-group>
				</view>
				<view class="spacer"></view>
				<button class="delete-btn" @click="deleteSelected" :disabled="selectedCount === 0">
					删除({{ selectedCount }})
				</button>
			</template>
		</view>
	</view>
</template>

<script setup>
import {
	ref,
	computed,
	onMounted
} from 'vue'
import {
	onShow
} from '@dcloudio/uni-app'
import {
	updateCartItemQuantity,
	removeFromCart,
	refreshCartData,
	syncCurrentUserData
} from '../../utils/cartUtils.js'

// 响应式数据
const cartData = ref({})
const isManageMode = ref(false)
const checkedItems = ref({
	Ticketing: [],
	Hotel: [],
	Souvenir: []
})

// 分组选中状态
const sectionChecked = ref({
	Ticketing: false,
	Hotel: false,
	Souvenir: false
})

// 计算属性
const isCartEmpty = computed(() => {
	// 基于当前页面的响应式数据判断是否为空
	return (!cartData.value.Ticketing || cartData.value.Ticketing.length === 0) &&
		(!cartData.value.Hotel || cartData.value.Hotel.length === 0) &&
		(!cartData.value.Souvenir || cartData.value.Souvenir.length === 0)
})

const selectedCount = computed(() => {
	return checkedItems.value.Ticketing.length +
		checkedItems.value.Hotel.length +
		checkedItems.value.Souvenir.length
})

const totalPrice = computed(() => {
	let total = 0

	// 计算票务总价
	checkedItems.value.Ticketing.forEach(id => {
		const item = cartData.value.Ticketing?.find(item => (item.id === id || item.card_id === id))
		if (item) {
			total += parseFloat(item.price) * parseInt(item.count)
		}
	})

	// 计算住宿总价
	checkedItems.value.Hotel.forEach(id => {
		const item = cartData.value.Hotel?.find(item => (item.id === id || item.card_id === id))
		if (item) {
			total += parseFloat(item.price) * parseInt(item.count)
		}
	})

	// 计算纪念品总价
	checkedItems.value.Souvenir.forEach(id => {
		const item = cartData.value.Souvenir?.find(item => (item.id === id || item.card_id === id))
		if (item) {
			total += parseFloat(item.price) * parseInt(item.count)
		}
	})

	return total.toFixed(2)
})

const isAllSelected = computed(() => {
	const totalItems = (cartData.value.Ticketing?.length || 0) +
		(cartData.value.Hotel?.length || 0) +
		(cartData.value.Souvenir?.length || 0)
	return totalItems > 0 && selectedCount.value === totalItems
})

// 页面加载时初始化数据
onMounted(async () => {
	await loadCartData()
})

// 页面显示时刷新数据
onShow(async () => {
	// 首先同步用户数据，确保与后端一致
	await syncCurrentUserData()

	// 然后加载购物车数据
	await loadCartData()

	// 清空选择状态，避免数据不一致
	checkedItems.value = {
		Ticketing: [],
		Hotel: [],
		Souvenir: []
	}
	updateSectionChecked()
})

// 从用户数据加载购物车数据
async function loadCartData() {
	try {
		// 使用refreshCartData获取最新数据
		const newCartData = await refreshCartData()

		// 确保响应式更新
		cartData.value = {
			Ticketing: newCartData.Ticketing || [],
			Hotel: newCartData.Hotel || [],
			Souvenir: newCartData.Souvenir || []
		}

	} catch (error) {
		console.error('加载购物车数据失败:', error)
		cartData.value = {
			Ticketing: [],
			Hotel: [],
			Souvenir: []
		}
	}
}



// 切换管理模式
function toggleManageMode() {
	isManageMode.value = !isManageMode.value
	if (!isManageMode.value) {
		// 退出管理模式时清空选择
		checkedItems.value = {
			Ticketing: [],
			Hotel: [],
			Souvenir: []
		}
		updateSectionChecked()
	}
}

// 分组勾选
function onSectionCheck(section, event) {
	const isChecked = event.detail.value.includes(section)

	if (isChecked) {
		// 选中该分组的所有项目，使用统一的ID获取方式
		checkedItems.value[section] = cartData.value[section]?.map(item => item.card_id || item.id) || []
	} else {
		// 取消选中该分组的所有项目
		checkedItems.value[section] = []
	}

	// 更新分组选中状态
	updateSectionChecked()
}

// 单项勾选
function onItemCheck(section, itemId, event) {
	const isChecked = event.detail.value.includes(itemId)

	if (isChecked) {
		// 添加到选中列表，避免重复添加
		if (!checkedItems.value[section].includes(itemId)) {
			checkedItems.value[section].push(itemId)
		}
	} else {
		// 从选中列表中移除
		const index = checkedItems.value[section].indexOf(itemId)
		if (index > -1) {
			checkedItems.value[section].splice(index, 1)
		}
	}

	// 更新分组选中状态
	updateSectionChecked()
}

// 更新分组选中状态
function updateSectionChecked() {
	Object.keys(sectionChecked.value).forEach(section => {
		const totalItems = cartData.value[section]?.length || 0
		const checkedCount = checkedItems.value[section].length
		sectionChecked.value[section] = totalItems > 0 && checkedCount === totalItems
	})
}

// 判断单项是否选中
function isItemChecked(section, itemId) {
	return checkedItems.value[section].includes(itemId)
}

// 全选/取消全选
function onSelectAll(event) {
	const isChecked = event.detail.value.includes('all')

	if (isChecked) {
		// 全选，使用统一的ID获取方式
		checkedItems.value.Ticketing = cartData.value.Ticketing?.map(item => item.card_id || item.id) || []
		checkedItems.value.Hotel = cartData.value.Hotel?.map(item => item.card_id || item.id) || []
		checkedItems.value.Souvenir = cartData.value.Souvenir?.map(item => item.card_id || item.id) || []
	} else {
		// 取消全选
		checkedItems.value = {
			Ticketing: [],
			Hotel: [],
			Souvenir: []
		}
	}

	updateSectionChecked()
}

// 增加数量
async function increaseQuantity(section, itemId) {
	const item = cartData.value[section]?.find(item => item.id === itemId || item.card_id === itemId)
	if (item) {
		const newQuantity = parseInt(item.count) + 1
		// 使用card_id或id作为标识符
		const cardId = item.card_id || item.id
		const success = await updateCartItemQuantity(section, cardId, newQuantity)
		if (success) {
			// 重新加载数据以确保同步
			await loadCartData()
		} else {
			uni.showToast({
				title: '更新数量失败',
				icon: 'none'
			})
		}
	}
}

// 减少数量
async function decreaseQuantity(section, itemId) {
	const item = cartData.value[section]?.find(item => item.id === itemId || item.card_id === itemId)
	if (item && parseInt(item.count) > 1) {
		const newQuantity = parseInt(item.count) - 1
		// 使用card_id或id作为标识符
		const cardId = item.card_id || item.id
		const success = await updateCartItemQuantity(section, cardId, newQuantity)
		if (success) {
			// 重新加载数据以确保同步
			await loadCartData()
		} else {
			uni.showToast({
				title: '更新数量失败',
				icon: 'none'
			})
		}
	}
}

// 结算
async function checkout() {
	if (selectedCount.value === 0) {
		uni.showToast({
			title: '请选择要结算的商品',
			icon: 'none'
		})
		return
	}

	try {
		// 收集选中的商品数据
		const selectedItems = []

		// 收集票务商品
		checkedItems.value.Ticketing.forEach(itemId => {
			const item = cartData.value.Ticketing?.find(item => (item.card_id || item.id) === itemId)
			if (item) {
				selectedItems.push({
					...item,
					category: 'Ticketing'
				})
			}
		})

		// 收集住宿商品
		checkedItems.value.Hotel.forEach(itemId => {
			const item = cartData.value.Hotel?.find(item => (item.card_id || item.id) === itemId)
			if (item) {
				selectedItems.push({
					...item,
					category: 'Hotel'
				})
			}
		})

		// 收集纪念品商品
		checkedItems.value.Souvenir.forEach(itemId => {
			const item = cartData.value.Souvenir?.find(item => (item.card_id || item.id) === itemId)
			if (item) {
				selectedItems.push({
					...item,
					category: 'Souvenir'
				})
			}
		})

		if (selectedItems.length === 0) {
			uni.showToast({
				title: '未找到选中的商品',
				icon: 'none'
			})
			return
		}

		// 显示处理中提示
		uni.showLoading({
			title: '处理中...'
		})

		// 获取当前用户
		const currentUserStr = uni.getStorageSync('currentUser')
		if (!currentUserStr) {
			uni.hideLoading()
			uni.showModal({
				title: '提示',
				content: '请先登录',
				showCancel: false,
				success: () => {
					uni.navigateTo({
						url: '/pages/LoginPage/LoginPage'
					})
				}
			})
			return
		}

		const currentUser = JSON.parse(currentUserStr)

		// 1. 先创建待付款订单
		const orderItems = selectedItems.map(item => ({
			card_id: item.card_id || item.id || Date.now().toString() + Math.random().toString(36).substring(2, 11),
			name: item.type || item.name,
			img: item.img,
			count: item.count,
			scheduledTime: item.scheduledTime || new Date().toISOString().split('T')[0],
			model: item.model || null,
			price: item.price,
			status: 0 // 待付款状态
		}))

		// 调用订单API创建订单
		const orderService = (await import('../../utils/orderUtils.js')).default
		await orderService.createOrder(currentUser.account, orderItems)

		// 2. 删除购物车中的商品
		const deletePromises = []
		Object.keys(checkedItems.value).forEach(section => {
			checkedItems.value[section].forEach(itemId => {
				// 查找对应的商品获取card_id
				const item = cartData.value[section]?.find(item => item.id === itemId || item.card_id === itemId)
				if (item) {
					const cardId = item.card_id || item.id
					deletePromises.push(removeFromCart(section, cardId))
				}
			})
		})

		// 等待所有删除操作完成
		await Promise.all(deletePromises)

		// 3. 重新加载购物车数据
		await loadCartData()

		// 4. 清空选择状态
		checkedItems.value = {
			Ticketing: [],
			Hotel: [],
			Souvenir: []
		}
		updateSectionChecked()

		// 5. 准备支付页面数据
		const orderData = {
			items: orderItems,
			totalPrice: totalPrice.value,
			totalCount: selectedCount.value,
			orderId: Date.now().toString() // 添加订单ID用于支付页面识别
		}

		// 将数据存储到本地，供支付页面使用
		uni.setStorageSync('checkoutData', JSON.stringify(orderData))

		uni.hideLoading()

		// 6. 跳转到支付页面
		uni.navigateTo({
			url: '/pages/PaymentPage/PaymentPage'
		})

		uni.showToast({
			title: '订单已生成',
			icon: 'success'
		})

	} catch (error) {
		uni.hideLoading()
		console.error('结算失败:', error)
		uni.showToast({
			title: '结算失败，请重试',
			icon: 'none'
		})
	}
}

// 删除选中商品
async function deleteSelected() {
	if (selectedCount.value === 0) {
		uni.showToast({
			title: '请选择要删除的商品',
			icon: 'none'
		})
		return
	}

	uni.showModal({
		title: '确认删除',
		content: `确定要删除选中的${selectedCount.value}件商品吗？`,
		success: async (res) => {
			if (res.confirm) {
				try {
					// 删除选中的商品
					const deletePromises = []
					Object.keys(checkedItems.value).forEach(section => {
						checkedItems.value[section].forEach(itemId => {
							// 查找对应的商品获取card_id
							const item = cartData.value[section]?.find(item => item.id === itemId || item.card_id === itemId)
							if (item) {
								const cardId = item.card_id || item.id
								deletePromises.push(removeFromCart(section, cardId))
							}
						})
					})

					// 等待所有删除操作完成
					await Promise.all(deletePromises)

					// 重新加载购物车数据
					await loadCartData()

					// 清空选择状态
					checkedItems.value = {
						Ticketing: [],
						Hotel: [],
						Souvenir: []
					}
					updateSectionChecked()

					uni.showToast({
						title: '删除成功',
						icon: 'success'
					})
				} catch (error) {
					console.error('删除失败:', error)
					uni.showToast({
						title: '删除失败，请重试',
						icon: 'none'
					})
				}
			}
		}
	})
}
</script>

<style scoped>
page {
	background-color: #f5f5f5;
}

.container {
	width: 100%;
	background-color: #f5f5f5;
	display: flex;
	flex-direction: column;
}

/* 头部样式 */
.header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 20rpx 30rpx;
	background-color: #f5f5f5;
}

.manage-btn {
	font-size: 32rpx;
	color: #333;
	padding: 10rpx 20rpx;
}

/* 购物车内容 */
.cart-content {
	flex: 1;
	padding: 0 0 120rpx 0;
}

/* 购物车分组 */
.cart-section {
	background-color: #ffffff;
	border-radius: 12rpx;
	margin: 0 20rpx 60rpx 20rpx;
	overflow: hidden;
}

.section-header {
	display: flex;
	align-items: center;
	padding: 30rpx;
	border-bottom: 1px solid #f0f0f0;
}

.section-checkbox {
	margin-right: 20rpx;
}

.section-title {
	font-size: 32rpx;
	font-weight: 600;
	color: #333;
}

/* 商品列表 */
.item-list {
	padding: 0;
}

.cart-item {
	display: flex;
	align-items: center;
	padding: 30rpx;
	border-bottom: 1px solid #f0f0f0;
}

.cart-item:last-child {
	border-bottom: none;
}

.item-checkbox {
	margin-right: 20rpx;
}

.item-image {
	width: 120rpx;
	height: 120rpx;
	border-radius: 8rpx;
	margin-right: 20rpx;
}

.item-info {
	flex: 1;
	display: flex;
	flex-direction: column;
	margin-right: 20rpx;
}

.item-name {
	font-size: 28rpx;
	color: #333;
	font-weight: 600;
	margin-bottom: 10rpx;
}

.item-detail {
	display: flex;
	flex-direction: column;
	margin-bottom: 10rpx;
}

.detail-label {
	font-size: 24rpx;
	color: #666;
	margin-bottom: 4rpx;
}

.detail-time {
	font-size: 24rpx;
	color: #666;
}

/* 纪念品的单行详情样式 */
.item-detail text {
	font-size: 24rpx;
	color: #666;
}

.item-price {
	font-size: 28rpx;
	color: #36cfc9;
	font-weight: 600;
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
	border: 1px solid #e0e0e0;
	background-color: #fff;
	border-radius: 8rpx;
	font-size: 32rpx;
	color: #333;
	display: flex;
	justify-content: center;
	align-items: center;
}

.quantity-text {
	font-size: 28rpx;
	color: #333;
	min-width: 60rpx;
	text-align: center;
}

/* 空购物车 */
.empty-cart {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 100rpx 0;
}

.empty-text {
	font-size: 32rpx;
	color: #666;
	margin-bottom: 20rpx;
}

.empty-subtitle {
	font-size: 28rpx;
	color: #999;
}

/* 底部控制栏 */
.bottom-bar {
	position: fixed;
	/* #ifdef MP-WEIXIN */
	bottom: 0;
	/* #endif */

	/* #ifdef H5 */
	bottom: 50px;
	/* #endif */
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

.select-all {
	margin-right: 30rpx;
}

.select-all-checkbox {
	display: flex;
	align-items: center;
	gap: 10rpx;
	font-size: 28rpx;
	color: #333;
}

.total-section {
	flex: 1;
	display: flex;
	align-items: center;
	justify-content: flex-end;
	margin-right: 30rpx;
}

.total-text {
	font-size: 28rpx;
	color: #333;
}

.total-price {
	font-size: 36rpx;
	font-weight: 700;
	color: #36cfc9;
}

.checkout-btn {
	background-color: #36cfc9;
	color: #fff;
	border: none;
	border-radius: 50rpx;
	padding: 20rpx 40rpx;
	font-size: 28rpx;
	font-weight: 600;
}

.checkout-btn:disabled {
	background-color: #ccc;
	color: #999;
}

.checkout-btn:active:not(:disabled) {
	background-color: #2bb8bb;
}

/* 管理模式样式 */
.spacer {
	flex: 1;
}

.delete-btn {
	background-color: #ff4d4f;
	color: #fff;
	border: none;
	border-radius: 50rpx;
	padding: 20rpx 40rpx;
	font-size: 28rpx;
	font-weight: 600;
}

.delete-btn:disabled {
	background-color: #ccc;
	color: #999;
}

.delete-btn:active:not(:disabled) {
	background-color: #d9363e;
}
</style>