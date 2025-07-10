<template>
	<view class="container">
		<!-- 导航栏 -->
		<view class="nav-bar">
			<view class="nav-left" @click="goBack">
				<text class="nav-icon">‹</text>
			</view>
			<text class="nav-title">编辑资料</text>
			<view class="nav-right"></view>
		</view>

		<!-- 头像编辑区域 -->
		<view class="avatar-section">
			<view class="avatar-container" @click="chooseAvatar">
				<image :src="formData.img || '/static/images/DefaultAvatar.png'" class="avatar-image" mode="aspectFill"></image>
				<view class="avatar-overlay">
					<text class="camera-icon">📷</text>
					<text class="avatar-text">点击更换头像</text>
				</view>
			</view>
		</view>

		<!-- 表单区域 -->
		<view class="form-section">
			<view class="form-item">
				<text class="form-label">用户名</text>
				<input v-model="formData.name" placeholder="请输入用户名" class="form-input" @blur="validateName"
					@input="clearNameError" />
				<text v-if="nameError" class="error-text">{{ nameError }}</text>
			</view>

			<view class="form-item">
				<text class="form-label">手机号</text>
				<input v-model="formData.phone" placeholder="请输入手机号" class="form-input" type="number" @blur="validatePhone"
					@input="clearPhoneError" />
				<text v-if="phoneError" class="error-text">{{ phoneError }}</text>
			</view>

			<view class="form-item">
				<text class="form-label">账号</text>
				<input v-model="formData.account" placeholder="账号不可修改" class="form-input disabled" disabled />
			</view>
		</view>

		<!-- 底部按钮 -->
		<view class="button-section">
			<button class="save-btn" @click="saveProfile" :disabled="saving">
				{{ saving ? '保存中...' : '保存修改' }}
			</button>
		</view>
	</view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import userService from '../../utils/userUtils.js'
import ImageUtils from '../../utils/imageUtils.js'

// 响应式数据
const formData = ref({
	name: '',
	phone: '',
	account: '',
	img: ''
})

const nameError = ref('')
const phoneError = ref('')
const saving = ref(false)

// 页面加载时获取当前用户信息
onMounted(() => {
	loadUserInfo()
})

// 加载用户信息
function loadUserInfo() {
	try {
		const currentUserStr = uni.getStorageSync('currentUser')
		if (currentUserStr) {
			const currentUser = JSON.parse(currentUserStr)
			formData.value = {
				name: currentUser.name || '',
				phone: currentUser.phone || '',
				account: currentUser.account || '',
				img: currentUser.img || '/static/images/DefaultAvatar.png'
			}
		}
	} catch (error) {
		console.error('加载用户信息失败:', error)
		uni.showToast({
			title: '加载用户信息失败',
			icon: 'none'
		})
	}
}

// 返回上一页
function goBack() {
	uni.navigateBack()
}

// 选择头像
async function chooseAvatar() {
	try {
		const base64Data = await ImageUtils.chooseImageAndConvertToBase64({
			loadingTitle: '处理头像中...',
			quality: 0.8,
			maxSizeMB: 10
		})

		// 更新头像数据
		formData.value.img = base64Data

	} catch (error) {
		console.error('头像选择失败:', error)
		// ImageUtils已经处理了错误提示，这里不需要额外处理
	}
}

// 验证用户名
function validateName() {
	if (!formData.value.name || !formData.value.name.trim()) {
		nameError.value = '请输入用户名'
		return false
	}
	if (formData.value.name.trim().length < 2) {
		nameError.value = '用户名至少2个字符'
		return false
	}
	if (formData.value.name.trim().length > 20) {
		nameError.value = '用户名不能超过20个字符'
		return false
	}
	nameError.value = ''
	return true
}

// 验证手机号
function validatePhone() {
	const phoneRegex = /^1[3-9]\d{9}$/
	if (!formData.value.phone || !formData.value.phone.trim()) {
		phoneError.value = '请输入手机号'
		return false
	}
	if (!phoneRegex.test(formData.value.phone.trim())) {
		phoneError.value = '请输入正确的手机号格式'
		return false
	}
	phoneError.value = ''
	return true
}

// 清除错误提示
function clearNameError() {
	nameError.value = ''
}

function clearPhoneError() {
	phoneError.value = ''
}

// 保存用户资料
async function saveProfile() {
	// 验证表单
	const isNameValid = validateName()
	const isPhoneValid = validatePhone()

	if (!isNameValid || !isPhoneValid) {
		return
	}

	saving.value = true

	try {
		// 准备更新数据
		const updateData = {
			account: formData.value.account,
			name: formData.value.name.trim(),
			phone: formData.value.phone.trim(),
			img: formData.value.img
		}


		// 显示加载提示
		uni.showLoading({
			title: '保存中...'
		})

		// 调用API更新用户信息
		const result = await userService.updateUser(updateData)

		// 更新本地存储的当前用户信息
		const currentUserStr = uni.getStorageSync('currentUser')
		if (currentUserStr) {
			const currentUser = JSON.parse(currentUserStr)
			const updatedUser = {
				...currentUser,
				...updateData
			}
			uni.setStorageSync('currentUser', JSON.stringify(updatedUser))
		}

		// 同时更新用户列表存储（如果存在）
		try {
			const usersStr = uni.getStorageSync('users')
			if (usersStr) {
				const users = JSON.parse(usersStr)
				const userIndex = users.findIndex(user => user.account === updateData.account)
				if (userIndex !== -1) {
					users[userIndex] = { ...users[userIndex], ...updateData }
					uni.setStorageSync('users', JSON.stringify(users))
					console.log('用户列表存储已更新')
				}
			}
		} catch (storageError) {
			console.warn('更新用户列表存储失败:', storageError)
		}

		uni.hideLoading()
		uni.showToast({
			title: '保存成功',
			icon: 'success'
		})

		// 延迟返回上一页
		setTimeout(() => {
			uni.navigateBack()
		}, 1500)

	} catch (error) {
		uni.hideLoading()
		console.error('保存用户资料失败:', error)

		// 提供更详细的错误信息
		let errorMessage = '保存失败'
		if (error.message) {
			if (error.message.includes('fetch')) {
				errorMessage = '网络连接失败，请检查网络'
			} else if (error.message.includes('账号')) {
				errorMessage = '账号信息错误'
			} else {
				errorMessage = error.message
			}
		}

		uni.showToast({
			title: errorMessage,
			icon: 'none',
			duration: 3000
		})
	} finally {
		saving.value = false
	}
}
</script>

<style scoped>
.container {
	background-color: #f5f5f5;
	min-height: 100vh;
}

/* 导航栏样式 */
.nav-bar {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 20rpx 30rpx;
	background-color: #36cfc9;
	color: #fff;
}

.nav-left {
	width: 60rpx;
	height: 60rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
}

.nav-icon {
	font-size: 48rpx;
	font-weight: bold;
}

.nav-title {
	font-size: 36rpx;
	font-weight: 600;
}

.nav-right {
	width: 60rpx;
}

/* 头像编辑区域 */
.avatar-section {
	display: flex;
	justify-content: center;
	padding: 60rpx 0;
	background-color: #fff;
	margin-bottom: 20rpx;
}

.avatar-container {
	position: relative;
	width: 200rpx;
	height: 200rpx;
	border-radius: 50%;
	overflow: hidden;
	cursor: pointer;
}

.avatar-image {
	width: 100%;
	height: 100%;
	border-radius: 50%;
}

.avatar-overlay {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: rgba(0, 0, 0, 0.5);
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	opacity: 0;
	transition: opacity 0.3s;
}

.avatar-container:hover .avatar-overlay {
	opacity: 1;
}

.camera-icon {
	font-size: 48rpx;
	color: #fff;
	margin-bottom: 10rpx;
}

.avatar-text {
	font-size: 24rpx;
	color: #fff;
}

/* 表单区域 */
.form-section {
	background-color: #fff;
	margin-bottom: 40rpx;
}

.form-item {
	padding: 30rpx;
	border-bottom: 1px solid #f0f0f0;
}

.form-item:last-child {
	border-bottom: none;
}

.form-label {
	display: block;
	font-size: 28rpx;
	color: #333;
	margin-bottom: 20rpx;
	font-weight: 500;
}

.form-input {
	padding: 20rpx 0;
	font-size: 32rpx;
	color: #333;
	border: none;
	background-color: transparent;
}

.form-input.disabled {
	color: #999;
	background-color: #f5f5f5;
	padding: 20rpx;
	border-radius: 8rpx;
}

.error-text {
	display: block;
	font-size: 24rpx;
	color: #ff4d4f;
	margin-top: 10rpx;
}

/* 底部按钮 */
.button-section {
	padding: 40rpx 30rpx;
}

.save-btn {
	width: 100%;
	height: 88rpx;
	background-color: #36cfc9;
	color: #fff;
	font-size: 32rpx;
	font-weight: 600;
	border-radius: 44rpx;
	border: none;
	display: flex;
	align-items: center;
	justify-content: center;
}

.save-btn:disabled {
	background-color: #d9d9d9;
	color: #999;
}
</style>
