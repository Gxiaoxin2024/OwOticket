<template>
	<view class="container">
		<!-- 用户信息区域 -->
		<view class="user-info-section">
			<view class="section-header">
				<text class="section-title">收货信息</text>
				<text class="edit-btn" @click="editUserInfo">{{ userInfo.name ? '编辑' : '填写' }}</text>
			</view>
			<view class="user-info-content" @click="editUserInfo">
				<view v-if="userInfo.name" class="user-info-filled">
					<view class="user-row">
						<text class="user-name">{{ userInfo.name }}</text>
						<text class="user-phone">{{ displayPhone }}</text>
					</view>
					<text class="user-address">{{ userInfo.address }}</text>
					<text class="user-detail-address" v-if="userInfo.detailAddress">{{ userInfo.detailAddress }}</text>
				</view>
				<view v-else class="user-info-empty">
					<text class="empty-text">请填写收货信息</text>
					<text class="arrow">></text>
				</view>
			</view>
		</view>

		<!-- 订单商品信息 -->
		<view class="order-section">
			<view class="section-header">
				<text class="section-title">订单商品</text>
				<text class="order-info">共{{ orderData.totalCount || 0 }}件商品</text>
			</view>
			<view class="order-items">
				<view class="order-item" v-for="item in orderData.items" :key="item.card_id || item.id">
					<image :src="item.img" class="item-image" mode="aspectFill"></image>
					<view class="item-info">
						<text class="item-name">{{ item.type || item.name }}</text>
						<view class="item-detail" v-if="item.card_id || item.id">
							<text class="detail-label">订单号：</text>
							<text class="detail-value">{{ item.card_id || item.id }}</text>
						</view>
						<view class="item-detail" v-if="item.scheduledTime">
							<text class="detail-label">预定时间：</text>
							<text class="detail-value">{{ formatScheduledTime(item.scheduledTime) }}</text>
						</view>
						<view class="item-detail" v-if="item.model">
							<text class="detail-label">规格：</text>
							<text class="detail-value">{{ formatModel(item.model) }}</text>
						</view>
						<view class="item-price-row">
							<text class="item-price">￥{{ parseFloat(item.price).toFixed(2) }}</text>
							<view class="quantity-controls">
								<button class="quantity-btn" @click="decreaseQuantity(item)">-</button>
								<text class="quantity-text">{{ item.count }}</text>
								<button class="quantity-btn" @click="increaseQuantity(item)">+</button>
							</view>
						</view>
					</view>
				</view>
			</view>
		</view>

		<!-- 优惠券区域 -->
		<view class="coupon-section">
			<view class="section-header">
				<text class="section-title">优惠券</text>
				<text class="coupon-count">{{ availableCouponCount }}张可用</text>
			</view>
			<view class="coupon-content" @click="selectCoupon">
				<view v-if="selectedCoupon" class="coupon-selected">
					<text class="coupon-name">{{ selectedCoupon.name }}</text>
					<text class="coupon-discount">-￥{{ selectedCoupon.discount }}</text>
				</view>
				<view v-else class="coupon-empty">
					<text class="empty-text">选择优惠券</text>
					<text class="arrow">></text>
				</view>
			</view>
		</view>

		<!-- 支付方式 -->
		<view class="payment-section">
			<view class="section-header">
				<text class="section-title">支付方式</text>
			</view>
			<view class="payment-methods">
				<view class="payment-item" v-for="method in paymentMethods" :key="method.id"
					:class="{ active: selectedPayment === method.id }" @click="selectPayment(method.id)">
					<text class="payment-emoji">{{ method.emoji }}</text>
					<text class="payment-name">{{ method.name }}</text>
					<view class="payment-radio" :class="{ checked: selectedPayment === method.id }"></view>
				</view>
			</view>
		</view>

		<!-- 其他选项 -->
		<view class="options-section">
			<view class="option-item">
				<text class="option-label">开发票</text>
				<switch :checked="needInvoice" @change="toggleInvoice" color="#36cfc9" />
			</view>
			<view class="option-item">
				<text class="option-label">号码保护</text>
				<switch :checked="phoneProtection" @change="togglePhoneProtection" color="#36cfc9" />
			</view>
		</view>

		<!-- 底部支付栏 -->
		<view class="payment-bar">
			<view class="total-section">
				<text class="total-label">合计：</text>
				<text class="total-price">￥{{ finalPrice || '0.00' }}</text>
			</view>
			<button class="pay-btn" @click="submitPayment">
				立即支付
			</button>
		</view>

		<!-- 用户信息编辑弹窗 -->
		<view v-if="showUserModal" class="modal-overlay" @click="closeUserModal">
			<view class="modal-content" @click.stop>
				<view class="modal-header">
					<text class="modal-title">填写收货信息</text>
					<text class="modal-close" @click="closeUserModal">×</text>
				</view>
				<view class="modal-body">
					<view class="form-item">
						<text class="form-label">姓名</text>
						<input v-model="tempUserInfo.name" placeholder="请输入姓名" class="form-input" @blur="validateName"
							@input="clearNameError" />
						<text v-if="nameError" class="error-text">{{ nameError }}</text>
					</view>
					<view class="form-item">
						<text class="form-label">手机号</text>
						<input v-model="tempUserInfo.phone" placeholder="请输入手机号（支持+86格式）" class="form-input" type="number"
							maxlength="18" @input="onPhoneInput" @blur="validatePhone" />
						<text v-if="phoneError" class="error-text">{{ phoneError }}</text>
					</view>
					<view class="form-item">
						<text class="form-label">地址</text>
						<view class="address-container">
							<view class="address-selector" @click="showAddressPicker">
								<text class="address-text" :class="{ placeholder: !selectedRegion }">
									{{ selectedRegion || '请选择省市区' }}
								</text>
								<text class="arrow-down">▼</text>
							</view>
							<text v-if="addressError && addressError.includes('省市区')" class="error-text">{{ addressError }}</text>
							<textarea v-model="tempUserInfo.detailAddress" placeholder="请输入详细地址（街道、门牌号等）"
								class="form-textarea detail-address" maxlength="200" @input="updateFullAddress"
								@blur="validateDetailAddress"></textarea>
							<text class="address-count">{{ tempUserInfo.detailAddress?.length || 0 }}/200</text>
							<text v-if="addressError && !addressError.includes('省市区')" class="error-text">{{ addressError }}</text>
						</view>
					</view>

					<!-- 新的地区选择器 -->
					<view v-if="showRegionPicker" class="region-selector-modal">
						<!-- 遮罩层 -->
						<view class="modal-mask" @click="cancelAddressPicker"></view>

						<!-- 选择器内容 -->
						<view class="region-selector-content">
							<!-- 头部 -->
							<view class="selector-header">
								<text class="cancel-btn" @click="cancelAddressPicker">取消</text>
								<text class="title">选择地区</text>
								<text class="confirm-btn" @click="confirmAddressPicker">确定</text>
							</view>

							<!-- 选择器主体 -->
							<view class="selector-body">
								<picker-view class="region-picker-view" :value="pickerValue" @change="onRegionChange"
									:indicator-style="indicatorStyle" :mask-style="maskStyle">
									<picker-view-column>
										<view v-for="(province, index) in provinces" :key="`p_${index}`" class="picker-option">
											<text class="option-text">{{ province.name }}</text>
										</view>
									</picker-view-column>
									<picker-view-column>
										<view v-for="(city, index) in cities" :key="`c_${index}`" class="picker-option">
											<text class="option-text">{{ city.name }}</text>
										</view>
									</picker-view-column>
									<picker-view-column>
										<view v-for="(district, index) in districts" :key="`d_${index}`" class="picker-option">
											<text class="option-text">{{ district }}</text>
										</view>
									</picker-view-column>
								</picker-view>
							</view>
						</view>
					</view>
				</view>
				<view class="modal-footer">
					<button class="modal-btn cancel-btn" @click="closeUserModal">取消</button>
					<button class="modal-btn confirm-btn" @click="saveUserInfo">确定</button>
				</view>
			</view>
		</view>

		<!-- 优惠券选择弹窗 -->
		<view v-if="showCouponModal" class="modal-overlay" @click="closeCouponModal">
			<view class="modal-content" @click.stop>
				<view class="modal-header">
					<text class="modal-title">选择优惠券</text>
					<text class="modal-close" @click="closeCouponModal">×</text>
				</view>
				<view class="modal-body">
					<view class="coupon-list">
						<!-- 可用优惠券 -->
						<view class="coupon-item" v-for="coupon in eligibleCoupons" :key="coupon.id"
							:class="{ selected: tempSelectedCoupon?.id === coupon.id }" @click="selectTempCoupon(coupon)">
							<view class="coupon-info">
								<text class="coupon-name">{{ coupon.name }}</text>
								<text class="coupon-desc">{{ coupon.description }}</text>
							</view>
							<text class="coupon-discount">-￥{{ coupon.discount }}</text>
						</view>
						<!-- 不可用优惠券 -->
						<view class="coupon-item disabled" v-for="coupon in unavailableCoupons" :key="'disabled_' + coupon.id">
							<view class="coupon-info">
								<text class="coupon-name">{{ coupon.name }}</text>
								<text class="coupon-desc">{{ coupon.description }}（还差￥{{ (coupon.minAmount - originalPrice).toFixed(2)
								}}）</text>
							</view>
							<text class="coupon-discount">-￥{{ coupon.discount }}</text>
						</view>
						<!-- 不使用优惠券选项 -->
						<view class="coupon-item" :class="{ selected: !tempSelectedCoupon }" @click="selectTempCoupon(null)">
							<view class="coupon-info">
								<text class="coupon-name">不使用优惠券</text>
							</view>
						</view>
					</view>
				</view>
				<view class="modal-footer">
					<button class="modal-btn cancel-btn" @click="closeCouponModal">取消</button>
					<button class="modal-btn confirm-btn" @click="confirmCoupon">确定</button>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import orderService from '../../utils/orderUtils.js'
import { CommonCoupons, CommonPaymentMethods } from '../../static/data/CommonData.js'
import { regionData } from '../../static/data/cityData.js'


// 响应式数据
const orderData = ref({ items: [], totalPrice: '0.00', totalCount: 0 })
const userInfo = ref({
	name: '小小新',
	phone: '19196966669',
	address: '江西省 南昌市 南昌县',
	detailAddress: '天庭南天门'
})
const tempUserInfo = ref({ name: '', phone: '', address: '', detailAddress: '' })
const showUserModal = ref(false)
const showCouponModal = ref(false)
const selectedCoupon = ref(null)
const tempSelectedCoupon = ref(null)
const selectedPayment = ref('wechat')
const needInvoice = ref(false)
const phoneProtection = ref(true)

// 表单验证相关
const nameError = ref('')
const phoneError = ref('')
const addressError = ref('')

// 地址选择器相关
const showRegionPicker = ref(false)
const selectedRegion = ref('江西省 南昌市 南昌县')
const pickerValue = ref([0, 0, 0])
const indicatorStyle = ref('height: 100rpx; border-top: 1px solid #e0e0e0; border-bottom: 1px solid #e0e0e0; background-color: rgba(54, 207, 201, 0.08);')
const maskStyle = ref('background: linear-gradient(180deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.4), transparent, rgba(255, 255, 255, 0.4), rgba(255, 255, 255, 0.9));')
const provinces = ref([])
const cities = ref([])
const districts = ref([])

// 优惠券数据（从CommonData.js导入）
const availableCoupons = ref(CommonCoupons)

// 支付方式数据（从CommonData.js导入）
const paymentMethods = ref(CommonPaymentMethods)

// 省市区数据（从cityData.js导入完整数据）

// 计算属性
const finalPrice = computed(() => {
	// 确保使用购物车传递过来的总金额
	let originalPrice = 0

	if (orderData.value.totalPrice) {
		originalPrice = parseFloat(orderData.value.totalPrice) || 0
	} else if (orderData.value.items && orderData.value.items.length > 0) {
		// 如果没有totalPrice，从商品列表计算
		originalPrice = orderData.value.items.reduce((sum, item) => {
			return sum + (parseFloat(item.price) || 0) * (parseInt(item.count) || 1)
		}, 0)
	}

	const discount = selectedCoupon.value ? selectedCoupon.value.discount : 0
	const result = Math.max(0, originalPrice - discount).toFixed(2)
	return result
})

// 显示的手机号（根据号码保护状态）
const displayPhone = computed(() => {
	if (!userInfo.value.phone) return ''

	if (phoneProtection.value) {
		// 号码保护开启时，隐藏中间几位数字
		const phone = userInfo.value.phone
		if (phone.length >= 7) {
			return phone.substring(0, 3) + '****' + phone.substring(phone.length - 4)
		}
		return phone
	} else {
		// 号码保护关闭时，显示完整号码
		return userInfo.value.phone
	}
})

// 计算当前订单金额（不含优惠券折扣）
const originalPrice = computed(() => {
	let total = 0
	if (orderData.value.totalPrice) {
		total = parseFloat(orderData.value.totalPrice) || 0
	} else if (orderData.value.items && orderData.value.items.length > 0) {
		total = orderData.value.items.reduce((sum, item) => {
			return sum + (parseFloat(item.price) || 0) * (parseInt(item.count) || 1)
		}, 0)
	}
	return total
})

// 过滤可用的优惠券（满足使用条件）
const eligibleCoupons = computed(() => {
	const currentAmount = originalPrice.value
	return availableCoupons.value.filter(coupon => {
		return currentAmount >= (coupon.minAmount || 0)
	})
})

// 显示可用优惠券数量
const availableCouponCount = computed(() => {
	return eligibleCoupons.value.length
})

// 不可用的优惠券（不满足使用条件）
const unavailableCoupons = computed(() => {
	const currentAmount = originalPrice.value
	return availableCoupons.value.filter(coupon => {
		return currentAmount < (coupon.minAmount || 0)
	})
})



// 获取当前用户
function getCurrentUser() {
	try {
		const currentUserStr = uni.getStorageSync('currentUser')
		return currentUserStr ? JSON.parse(currentUserStr) : null
	} catch (error) {
		console.error('获取当前用户失败:', error)
		return null
	}
}

// 页面加载时获取数据
onLoad(() => {
	loadOrderData()
})

// 加载订单数据
function loadOrderData() {
	try {
		const checkoutDataStr = uni.getStorageSync('checkoutData')
		if (checkoutDataStr) {
			orderData.value = JSON.parse(checkoutDataStr)

			// 确保totalPrice是字符串格式
			if (typeof orderData.value.totalPrice === 'number') {
				orderData.value.totalPrice = orderData.value.totalPrice.toString()
			}

			// 计算商品总数量
			if (orderData.value.items && orderData.value.items.length > 0) {
				orderData.value.totalCount = orderData.value.items.reduce((sum, item) => {
					return sum + (parseInt(item.count) || 1)
				}, 0)
			} else {
				orderData.value.totalCount = 0
			}

			// 如果totalPrice为空或0，尝试从商品列表重新计算
			if (!orderData.value.totalPrice || parseFloat(orderData.value.totalPrice) === 0) {
				if (orderData.value.items && orderData.value.items.length > 0) {
					const calculatedTotal = orderData.value.items.reduce((sum, item) => {
						const price = parseFloat(item.price) || 0
						const count = parseInt(item.count) || 1
						return sum + (price * count)
					}, 0)
					orderData.value.totalPrice = calculatedTotal.toFixed(2)
				}
			}

			// 显示订单已创建的提示
			if (orderData.value.orderId) {
				uni.showToast({
					title: '订单已创建，请完成支付',
					icon: 'none',
					duration: 2000
				})
			}
		} else {
			uni.showModal({
				title: '提示',
				content: '未找到订单数据',
				showCancel: false,
				success: () => {
					uni.navigateBack()
				}
			})
		}
	} catch (error) {
		console.error('加载订单数据失败:', error)
		uni.navigateBack()
	}
}

// 格式化商品规格
function formatModel(model) {
	if (!model) return ''
	if (typeof model === 'string') return model
	if (typeof model === 'object') {
		const parts = []
		if (model.size) parts.push(`尺寸: ${model.size}`)
		if (model.color) parts.push(`颜色: ${model.color}`)
		return parts.join(', ')
	}
	return ''
}

// 格式化预定时间为 YYYY-MM-DD HH:MM 格式
function formatScheduledTime(scheduledTime) {
	if (!scheduledTime) return ''

	try {
		let dateTime = scheduledTime

		// 如果是日期字符串，添加默认时间
		if (scheduledTime.match(/^\d{4}-\d{2}-\d{2}$/)) {
			dateTime = scheduledTime + ' 09:00'
		}
		// 如果是其他格式，尝试解析
		else if (scheduledTime.includes('/')) {
			const parts = scheduledTime.split('/')
			if (parts.length === 3) {
				// 假设是MM/DD/YYYY格式，转换为YYYY-MM-DD HH:MM
				const year = parts[2]
				const month = parts[0].padStart(2, '0')
				const day = parts[1].padStart(2, '0')
				dateTime = `${year}-${month}-${day} 09:00`
			}
		}
		// 如果包含T（ISO格式），转换为本地时间格式
		else if (scheduledTime.includes('T')) {
			const date = new Date(scheduledTime)
			const year = date.getFullYear()
			const month = String(date.getMonth() + 1).padStart(2, '0')
			const day = String(date.getDate()).padStart(2, '0')
			const hours = String(date.getHours()).padStart(2, '0')
			const minutes = String(date.getMinutes()).padStart(2, '0')
			dateTime = `${year}-${month}-${day} ${hours}:${minutes}`
		}

		return dateTime
	} catch (error) {
		console.error('格式化预定时间失败:', error)
		return scheduledTime
	}
}

// 数量控制
function decreaseQuantity(item) {
	if (item.count > 1) {
		item.count--
		updateTotalPrice()
	}
}

function increaseQuantity(item) {
	item.count++
	updateTotalPrice()
}

// 更新总价
function updateTotalPrice() {
	let total = 0
	orderData.value.items.forEach(item => {
		total += parseFloat(item.price) * item.count
	})
	orderData.value.totalPrice = total.toFixed(2)
	orderData.value.totalCount = orderData.value.items.reduce((sum, item) => sum + item.count, 0)
}

// 姓名验证相关
function validateName() {
	const name = tempUserInfo.value.name?.trim()
	if (!name) {
		nameError.value = '请输入姓名'
		return false
	}

	if (name.length < 2) {
		nameError.value = '姓名至少需要2个字符'
		return false
	}

	if (name.length > 20) {
		nameError.value = '姓名不能超过20个字符'
		return false
	}

	nameError.value = ''
	return true
}

function clearNameError() {
	nameError.value = ''
}

// 手机号验证相关
function onPhoneInput(event) {
	let phone = event.detail.value
	// 移除所有非数字和+号的字符
	phone = phone.replace(/[^\d+]/g, '')

	// 如果以+86开头，保留+86
	if (phone.startsWith('+86')) {
		phone = '+86' + phone.substring(3).replace(/[^\d]/g, '')
	} else if (phone.startsWith('86') && phone.length > 2) {
		// 如果以86开头但没有+号，自动添加+号
		phone = '+86' + phone.substring(2)
	} else {
		// 普通手机号，只保留数字
		phone = phone.replace(/[^\d]/g, '')
	}

	tempUserInfo.value.phone = phone
	phoneError.value = ''
}

function validatePhone() {
	const phone = tempUserInfo.value.phone
	if (!phone) {
		phoneError.value = '请输入手机号'
		return false
	}

	// 支持+86格式和普通11位手机号
	const phoneRegex = /^(\+86)?1[3-9]\d{9}$/
	if (!phoneRegex.test(phone)) {
		phoneError.value = '请输入正确的手机号格式'
		return false
	}

	phoneError.value = ''
	return true
}

// 地址选择相关
function initRegionData() {
	provinces.value = regionData

	// 尝试找到江西省的索引
	const jiangxiIndex = provinces.value.findIndex(p => p.name === '江西省')
	const defaultProvinceIndex = jiangxiIndex >= 0 ? jiangxiIndex : 0

	if (provinces.value.length > 0 && provinces.value[defaultProvinceIndex]) {
		cities.value = provinces.value[defaultProvinceIndex].cities || []

		// 尝试找到南昌市的索引
		const nanchangIndex = cities.value.findIndex(c => c.name === '南昌市')
		const defaultCityIndex = nanchangIndex >= 0 ? nanchangIndex : 0

		if (cities.value.length > 0 && cities.value[defaultCityIndex]) {
			districts.value = cities.value[defaultCityIndex].districts || []

			// 尝试找到南昌县的索引
			const nanchangCountyIndex = districts.value.findIndex(d => d === '南昌县')
			const defaultDistrictIndex = nanchangCountyIndex >= 0 ? nanchangCountyIndex : 0

			pickerValue.value = [defaultProvinceIndex, defaultCityIndex, defaultDistrictIndex]
		} else {
			districts.value = []
			pickerValue.value = [defaultProvinceIndex, defaultCityIndex, 0]
		}
	} else {
		cities.value = []
		districts.value = []
		pickerValue.value = [defaultProvinceIndex, 0, 0]
	}
}

function showAddressPicker() {
	initRegionData()

	// 如果已有选中的地区，尝试定位到对应的索引
	if (selectedRegion.value) {
		const parts = selectedRegion.value.split(' ')
		if (parts.length >= 3) {
			const provinceName = parts[0]
			const cityName = parts[1]
			const districtName = parts[2]

			// 查找省份索引
			const provinceIndex = provinces.value.findIndex(p => p.name === provinceName)
			if (provinceIndex >= 0) {
				// 更新城市列表
				if (provinces.value[provinceIndex]) {
					cities.value = provinces.value[provinceIndex].cities || []
				}

				// 查找城市索引
				const cityIndex = cities.value.findIndex(c => c.name === cityName)
				if (cityIndex >= 0) {
					// 更新区县列表
					if (cities.value[cityIndex]) {
						districts.value = cities.value[cityIndex].districts || []
					}

					// 查找区县索引
					const districtIndex = districts.value.findIndex(d => d === districtName)
					if (districtIndex >= 0) {
						pickerValue.value = [provinceIndex, cityIndex, districtIndex]
					} else {
						pickerValue.value = [provinceIndex, cityIndex, 0]
					}
				} else {
					pickerValue.value = [provinceIndex, 0, 0]
				}
			}
		}
	}

	showRegionPicker.value = true

	// 延迟一帧确保picker-view正确渲染
	setTimeout(() => {
		// 强制触发一次更新以确保对齐
		const currentValue = [...pickerValue.value]
		pickerValue.value = [0, 0, 0]
		setTimeout(() => {
			pickerValue.value = currentValue
		}, 50)
	}, 100)
}

function cancelAddressPicker() {
	showRegionPicker.value = false
}

function confirmAddressPicker() {
	const province = provinces.value[pickerValue.value[0]]?.name || ''
	const city = cities.value[pickerValue.value[1]]?.name || ''
	const district = districts.value[pickerValue.value[2]] || ''

	selectedRegion.value = `${province} ${city} ${district}`.trim()
	updateFullAddress()
	showRegionPicker.value = false

	// 清除省市区相关的错误提示
	if (selectedRegion.value) {
		if (addressError.value.includes('省市区')) {
			addressError.value = ''
		}
	}
}

function onRegionChange(event) {
	const [provinceIndex, cityIndex, districtIndex] = event.detail.value

	// 省份变化
	if (pickerValue.value[0] !== provinceIndex) {
		// 更新城市列表
		if (provinces.value[provinceIndex]) {
			cities.value = provinces.value[provinceIndex].cities || []
			// 更新区县列表
			if (cities.value.length > 0) {
				districts.value = cities.value[0].districts || []
			} else {
				districts.value = []
			}
		} else {
			cities.value = []
			districts.value = []
		}
		pickerValue.value = [provinceIndex, 0, 0]
	}
	// 城市变化
	else if (pickerValue.value[1] !== cityIndex) {
		// 更新区县列表
		if (cities.value[cityIndex]) {
			districts.value = cities.value[cityIndex].districts || []
		} else {
			districts.value = []
		}
		pickerValue.value = [provinceIndex, cityIndex, 0]
	}
	// 区县变化
	else {
		pickerValue.value = [provinceIndex, cityIndex, districtIndex]
	}
}



function updateFullAddress() {
	const region = selectedRegion.value
	const detail = tempUserInfo.value.detailAddress || ''
	tempUserInfo.value.address = region ? `${region} ${detail}`.trim() : detail

	// 清除地址相关错误（但不验证，等用户失焦时再验证）
	if (region && detail.trim().length >= 5) {
		addressError.value = ''
	}
}

function validateDetailAddress() {
	if (!selectedRegion.value) {
		addressError.value = '请先选择省市区'
		return false
	}

	const detail = tempUserInfo.value.detailAddress?.trim()
	if (!detail) {
		addressError.value = '请输入详细地址'
		return false
	}

	if (detail.length < 5) {
		addressError.value = '详细地址至少需要5个字符'
		return false
	}

	if (detail.length > 200) {
		addressError.value = '详细地址不能超过200个字符'
		return false
	}

	addressError.value = ''
	return true
}



// 用户信息相关
function editUserInfo() {
	tempUserInfo.value = {
		...userInfo.value,
		detailAddress: userInfo.value.address ? userInfo.value.address.replace(selectedRegion.value, '').trim() : ''
	}

	// 如果已有地址，尝试解析省市区
	if (userInfo.value.address) {
		const addressParts = userInfo.value.address.split(' ')
		if (addressParts.length >= 3) {
			selectedRegion.value = addressParts.slice(0, 3).join(' ')
			tempUserInfo.value.detailAddress = addressParts.slice(3).join(' ')
		}
	}

	// 清除所有错误提示
	nameError.value = ''
	phoneError.value = ''
	addressError.value = ''
	showUserModal.value = true
}

function closeUserModal() {
	showUserModal.value = false
	showRegionPicker.value = false
}

function saveUserInfo() {
	// 执行所有验证
	const isNameValid = validateName()
	const isPhoneValid = validatePhone()

	// 验证地址
	let isAddressValid = true
	if (!selectedRegion.value) {
		addressError.value = '请选择省市区'
		isAddressValid = false
	} else if (!tempUserInfo.value.detailAddress || tempUserInfo.value.detailAddress.trim().length < 5) {
		addressError.value = '详细地址至少需要5个字符'
		isAddressValid = false
	} else {
		addressError.value = ''
	}

	// 如果有任何验证失败，不保存
	if (!isNameValid || !isPhoneValid || !isAddressValid) {
		return
	}

	// 更新完整地址
	updateFullAddress()

	userInfo.value = {
		name: tempUserInfo.value.name.trim(),
		phone: tempUserInfo.value.phone,
		address: tempUserInfo.value.address
	}
	closeUserModal()

	uni.showToast({
		title: '信息保存成功',
		icon: 'success'
	})
}

// 优惠券相关
function selectCoupon() {
	tempSelectedCoupon.value = selectedCoupon.value
	showCouponModal.value = true
}

function closeCouponModal() {
	showCouponModal.value = false
}

function selectTempCoupon(coupon) {
	// 检查优惠券是否可用
	if (coupon && originalPrice.value < (coupon.minAmount || 0)) {
		uni.showToast({
			title: `还需消费￥${(coupon.minAmount - originalPrice.value).toFixed(2)}才能使用此优惠券`,
			icon: 'none',
			duration: 2000
		})
		return
	}
	tempSelectedCoupon.value = coupon
}

function confirmCoupon() {
	// 再次验证选中的优惠券是否可用
	if (tempSelectedCoupon.value && originalPrice.value < (tempSelectedCoupon.value.minAmount || 0)) {
		uni.showToast({
			title: '所选优惠券不满足使用条件',
			icon: 'none'
		})
		return
	}
	selectedCoupon.value = tempSelectedCoupon.value
	closeCouponModal()
}

// 支付方式选择
function selectPayment(paymentId) {
	selectedPayment.value = paymentId
}

// 开关控制
function toggleInvoice(event) {
	needInvoice.value = event.detail.value
}

function togglePhoneProtection(event) {
	phoneProtection.value = event.detail.value
}



// 提交支付
async function submitPayment() {

	// 详细验证支付条件
	const errors = []

	// 验证用户信息
	if (!userInfo.value.name || userInfo.value.name.trim().length < 2) {
		errors.push('请填写收货人姓名')
	}

	if (!userInfo.value.phone) {
		errors.push('请填写收货人手机号')
	} else {
		const phoneRegex = /^(\+86)?1[3-9]\d{9}$/
		if (!phoneRegex.test(userInfo.value.phone)) {
			errors.push('手机号格式不正确')
		}
	}

	if (!userInfo.value.address || userInfo.value.address.trim().length < 5) {
		errors.push('请填写完整的收货地址')
	}

	// 验证订单信息
	if (!orderData.value.items || orderData.value.items.length === 0) {
		errors.push('订单中没有商品')
	}

	const currentFinalPrice = parseFloat(finalPrice.value) || 0
	if (currentFinalPrice <= 0) {
		errors.push('订单金额异常，请检查商品价格')
	}

	// 如果有错误，显示详细提示
	if (errors.length > 0) {
		const errorMessage = '无法提交支付，请检查以下问题：\n' + errors.map((error, index) => `${index + 1}. ${error}`).join('\n')
		uni.showModal({
			title: '信息不完整',
			content: errorMessage,
			showCancel: false,
			confirmText: '知道了'
		})
		return
	}

	const currentUser = getCurrentUser()
	if (!currentUser) {
		uni.showModal({
			title: '提示',
			content: '请先登录',
			showCancel: false,
			success: () => {
				uni.navigateBack()
			}
		})
		return
	}

	try {
		// 准备订单数据
		const orderItems = orderData.value.items.map(item => {
			// 处理scheduledTime，确保是YYYY-MM-DD格式
			let scheduledTime = item.scheduledTime || new Date().toISOString().split('T')[0]

			// 如果是ISO时间戳格式，转换为日期格式
			if (scheduledTime.includes('T')) {
				scheduledTime = scheduledTime.split('T')[0]
			}

			// 如果是其他格式，尝试解析为日期
			if (scheduledTime.includes('/')) {
				const parts = scheduledTime.split('/')
				if (parts.length === 3) {
					// 假设是MM/DD/YYYY或DD/MM/YYYY格式，转换为YYYY-MM-DD
					const year = parts[2]
					const month = parts[0].padStart(2, '0')
					const day = parts[1].padStart(2, '0')
					scheduledTime = `${year}-${month}-${day}`
				}
			}

			return {
				card_id: (item.card_id || item.id || Date.now().toString() + Math.random().toString(36).substring(2, 11)).toString(),
				name: (item.type || item.name || '').toString(),
				img: (item.img || '').toString(),
				count: parseInt(item.count) || 1,
				scheduledTime: scheduledTime,
				model: item.model || null,
				price: (item.price || '0').toString(),
				status: 0 // 待付款状态
			}
		})

		// 显示支付确认弹窗
		uni.showModal({
			title: '确认支付',
			content: `支付方式：${getPaymentMethodName(selectedPayment.value)}\n支付金额：￥${finalPrice.value}`,
			success: async (res) => {
				if (res.confirm) {
					// 模拟支付过程
					await simulatePayment(currentUser.account, orderItems)
				}
			}
		})

	} catch (error) {
		console.error('支付失败:', error)
		uni.showToast({
			title: '支付失败，请重试',
			icon: 'none'
		})
	}
}

// 获取支付方式名称
function getPaymentMethodName(paymentId) {
	const method = paymentMethods.value.find(m => m.id === paymentId)
	return method ? method.name : '未知支付方式'
}

// 模拟支付过程
async function simulatePayment(account, orderItems) {
	uni.showLoading({
		title: '支付中...'
	})

	try {
		// 模拟支付延迟
		await new Promise(resolve => setTimeout(resolve, 2000))

		// 支付成功后，更新订单状态为已支付
		const paidItems = orderItems.map(item => ({
			...item,
			status: 1 // 待消费状态
		}))

		// 删除原订单并创建新的已支付订单
		for (const item of orderItems) {
			await orderService.deleteOrderItem(item.card_id)
		}
		await orderService.createOrder(account, paidItems)

		uni.hideLoading()

		// 显示支付成功
		uni.showModal({
			title: '支付成功',
			content: '支付完成，请在"我的订单"中查看订单详情',
			showCancel: false,
			success: () => {
				// 清除临时数据
				uni.removeStorageSync('checkoutData')
				// 返回购物车页面
				uni.navigateBack()
			}
		})

	} catch (error) {
		uni.hideLoading()
		console.error('支付处理失败:', error)
		uni.showToast({
			title: '支付失败，请重试',
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
	background-color: #f5f5f5;
	padding-bottom: 120rpx;
}

/* 通用区域样式 */
.user-info-section,
.order-section,
.coupon-section,
.payment-section,
.options-section {
	background-color: #fff;
	margin-bottom: 20rpx;
	padding: 0 30rpx;
}

.section-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 30rpx 0;
	border-bottom: 1px solid #f0f0f0;
}

.section-title {
	font-size: 32rpx;
	font-weight: 500;
	color: #333;
}

.edit-btn,
.coupon-count,
.order-info {
	font-size: 26rpx;
	color: #36cfc9;
}

/* 用户信息区域 */
.user-info-content {
	padding: 30rpx 0;
}

.user-info-filled .user-row {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 16rpx;
}

.user-name {
	font-size: 32rpx;
	font-weight: 500;
	color: #333;
}

.user-phone {
	font-size: 28rpx;
	color: #666;
}

.user-address {
	font-size: 28rpx;
	color: #666;
	line-height: 1.5;
}

.user-detail-address {
	font-size: 28rpx;
	color: #666;
	line-height: 1.5;
	margin-top: 8rpx;
}

.user-info-empty {
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.empty-text {
	font-size: 28rpx;
	color: #999;
}

.arrow {
	font-size: 24rpx;
	color: #999;
}

/* 订单商品区域 */
.order-items {
	padding: 20rpx 0;
}

.order-item {
	display: flex;
	padding: 20rpx 0;
	border-bottom: 1px solid #f0f0f0;
}

.order-item:last-child {
	border-bottom: none;
}

.item-image {
	width: 120rpx;
	height: 120rpx;
	border-radius: 12rpx;
	margin-right: 24rpx;
}

.item-info {
	flex: 1;
}

.item-name {
	font-size: 30rpx;
	font-weight: 500;
	color: #333;
	margin-bottom: 12rpx;
}

.item-detail {
	display: flex;
	margin-bottom: 8rpx;
}

.detail-label {
	font-size: 24rpx;
	color: #666;
	margin-right: 8rpx;
}

.detail-value {
	font-size: 24rpx;
	color: #333;
}

.item-price-row {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-top: 16rpx;
}

.item-price {
	font-size: 28rpx;
	font-weight: 500;
	color: #ff152f;
}

.quantity-controls {
	display: flex;
	align-items: center;
	gap: 16rpx;
}

.quantity-btn {
	width: 60rpx;
	height: 60rpx;
	border: 1px solid #ddd;
	border-radius: 8rpx;
	background-color: #fff;
	font-size: 32rpx;
	color: #333;
	display: flex;
	align-items: center;
	justify-content: center;
}

.quantity-btn:active {
	background-color: #f5f5f5;
}

.quantity-text {
	font-size: 28rpx;
	color: #333;
	min-width: 40rpx;
	text-align: center;
}

/* 优惠券区域 */
.coupon-content {
	padding: 30rpx 0;
}

.coupon-selected,
.coupon-empty {
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.coupon-name {
	font-size: 28rpx;
	color: #333;
}

.coupon-discount {
	font-size: 28rpx;
	font-weight: 500;
	color: #ff152f;
}

/* 支付方式区域 */
.payment-methods {
	padding: 20rpx 0;
}

.payment-item {
	display: flex;
	align-items: center;
	padding: 24rpx 0;
	border-bottom: 1px solid #f0f0f0;
}

.payment-item:last-child {
	border-bottom: none;
}

.payment-item.active {
	background-color: #f6ffed;
}

.payment-emoji {
	font-size: 48rpx;
	margin-right: 24rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	width: 60rpx;
	height: 60rpx;
}

.payment-name {
	flex: 1;
	font-size: 28rpx;
	color: #333;
}

.payment-radio {
	width: 40rpx;
	height: 40rpx;
	border: 2px solid #ddd;
	border-radius: 50%;
	position: relative;
}

.payment-radio.checked {
	border-color: #36cfc9;
}

.payment-radio.checked::after {
	content: '';
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	width: 20rpx;
	height: 20rpx;
	background-color: #36cfc9;
	border-radius: 50%;
}

/* 其他选项区域 */
.option-item {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 30rpx 0;
	border-bottom: 1px solid #f0f0f0;
}

.option-item:last-child {
	border-bottom: none;
}

.option-label {
	font-size: 28rpx;
	color: #333;
}

/* 底部支付栏 */
.payment-bar {
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	background-color: #fff;
	padding: 20rpx 30rpx;
	border-top: 1px solid #f0f0f0;
	display: flex;
	justify-content: space-between;
	align-items: center;
	z-index: 100;
}

.total-section {
	display: flex;
	align-items: center;
}

.total-label {
	font-size: 28rpx;
	color: #333;
	margin-right: 8rpx;
}

.total-price {
	font-size: 36rpx;
	font-weight: 600;
	color: #ff152f;
}

.pay-btn {
	background: linear-gradient(135deg, #ff152f, #ff4757);
	color: #fff !important;
	border: none;
	border-radius: 50rpx;
	padding: 0;
	font-size: 28rpx;
	font-weight: 500;
	box-shadow: 0 4rpx 12rpx rgba(255, 21, 47, 0.3);
	margin-right: 0;
	width: 210rpx;
	height: 90rpx;
	line-height: 1;
	display: flex;
	align-items: center;
	justify-content: center;
}

.pay-btn:disabled {
	box-shadow: none;
}

.pay-btn:active:not(:disabled) {
	transform: scale(0.98);
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
	align-items: center;
	justify-content: center;
	z-index: 1000;
}

.modal-content {
	background-color: #fff;
	border-radius: 20rpx;
	width: 90%;
	max-width: 600rpx;
	max-height: 80vh;
	overflow: hidden;
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
	font-weight: 500;
	color: #333;
}

.modal-close {
	font-size: 48rpx;
	color: #999;
	line-height: 1;
}

.modal-body {
	padding: 30rpx;
	max-height: 60vh;
	overflow-y: auto;
}

.modal-footer {
	display: flex;
	border-top: 1px solid #f0f0f0;
}

.modal-btn {
	flex: 1;
	padding: 30rpx;
	border: none;
	font-size: 28rpx;
	background-color: #fff;
}

.cancel-btn {
	color: #666;
	border-right: 1px solid #f0f0f0;
}

.confirm-btn {
	color: #36cfc9;
	font-weight: 500;
}

/* 表单样式 */
.form-item {
	margin-bottom: 30rpx;
}

.form-label {
	display: block;
	font-size: 28rpx;
	color: #333;
	margin-bottom: 16rpx;
}

.form-input,
.form-textarea {
	width: auto;
	padding: 20rpx;
	border: 1px solid #ddd;
	border-radius: 8rpx;
	font-size: 28rpx;
	color: #333;
	background-color: #fff;
}

.form-textarea {
	height: 120rpx;
	resize: none;
}

/* 错误提示样式 */
.error-text {
	font-size: 24rpx;
	color: #ff4d4f;
	margin-top: 8rpx;
	display: block;
	line-height: 1.4;
	animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
	from {
		opacity: 0;
		transform: translateY(-10rpx);
	}

	to {
		opacity: 1;
		transform: translateY(0);
	}
}

/* 地址容器样式 */
.address-container {
	position: relative;
}

.address-selector {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 20rpx;
	border: 1px solid #ddd;
	border-radius: 8rpx;
	background-color: #fff;
	margin-bottom: 16rpx;
}

.address-text {
	font-size: 28rpx;
	color: #333;
	flex: 1;
}

.address-text.placeholder {
	color: #999;
}

.arrow-down {
	font-size: 24rpx;
	color: #666;
	margin-left: 16rpx;
}

.detail-address {
	margin-bottom: 8rpx;
}

.address-count {
	font-size: 24rpx;
	color: #999;
	text-align: right;
}

/* 新的地址选择器样式 */
.region-selector-modal {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	z-index: 9999;
	display: flex;
	align-items: flex-end;
}

.modal-mask {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: rgba(0, 0, 0, 0.5);
}

.region-selector-content {
	position: relative;
	width: 100%;
	background-color: #fff;
	border-radius: 20rpx 20rpx 0 0;
	overflow: hidden;
}

.selector-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 30rpx 40rpx;
	border-bottom: 1px solid #f0f0f0;
	background-color: #fff;
}

.cancel-btn,
.confirm-btn {
	font-size: 32rpx;
	color: #36cfc9;
	font-weight: 500;
}

.title {
	font-size: 36rpx;
	font-weight: 600;
	color: #333;
}

.selector-body {
	height: 500rpx;
	background-color: #fff;
	overflow: hidden;
	position: relative;
}

.region-picker-view {
	width: 100%;
	height: 500rpx;
	position: relative;
}

.picker-option {
	height: 100rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 0;
	margin: 0;
	box-sizing: border-box;
}

.option-text {
	font-size: 32rpx;
	color: #333;
	text-align: center;
	line-height: 1;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

/* 优惠券列表样式 */
.coupon-list {
	max-height: 400rpx;
	overflow-y: auto;
}

.coupon-item {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 24rpx;
	border: 1px solid #f0f0f0;
	border-radius: 12rpx;
	margin-bottom: 16rpx;
	background-color: #fff;
}

.coupon-item.selected {
	border-color: #36cfc9;
	background-color: #f6ffed;
}

.coupon-item.disabled {
	opacity: 0.5;
	background-color: #f5f5f5;
	border-color: #e0e0e0;
	pointer-events: none;
}

.coupon-item.disabled .coupon-name,
.coupon-item.disabled .coupon-desc,
.coupon-item.disabled .coupon-discount {
	color: #999;
}

.coupon-info {
	flex: 1;
}

.coupon-name {
	font-size: 28rpx;
	font-weight: 500;
	color: #333;
	margin-bottom: 8rpx;
}

.coupon-desc {
	font-size: 24rpx;
	color: #666;
}

.coupon-discount {
	font-size: 28rpx;
	font-weight: 500;
	color: #ff152f;
}
</style>