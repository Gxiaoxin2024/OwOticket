<template>
	<view class="container">
		<!-- 用户信息区域 -->
		<view class="user-section">
			<view class="user-info">
				<image :src="userInfo.img" class="user-avatar" mode="aspectFill"></image>
				<view class="user-details">
					<text class="user-name">{{ userInfo.name }}</text>
					<text class="user-account">账号：{{ userInfo.account }}</text>
				</view>
				<view class="action-buttons">
					<text class="action-btn refresh-btn" @click="refreshUserInfo">🔄刷新</text>
					<text class="action-btn edit-btn" @click="editProfile">🔧编辑</text>
				</view>
			</view>
		</view>

		<!-- 账户安全 -->
		<view class="settings-section">
			<view class="section-title">
				<text class="title-text">账户安全</text>
			</view>
			<view class="settings-list">
				<view class="setting-item" @click="changePassword">
					<view class="setting-content">
						<text class="setting-icon">🔒</text>
						<text class="setting-label">修改密码</text>
					</view>
					<text class="setting-arrow">></text>
				</view>
				<view class="setting-item" @click="togglePhoneProtection">
					<view class="setting-content">
						<text class="setting-icon">📱</text>
						<text class="setting-label">手机号保护</text>
					</view>
					<switch :checked="phoneProtectionEnabled" @change="onPhoneProtectionChange" />
				</view>
				<view class="setting-item" @click="bindPhone">
					<view class="setting-content">
						<text class="setting-icon">📞</text>
						<text class="setting-label">绑定手机号</text>
					</view>
					<view class="setting-value">
						<text class="phone-display">{{ displayPhone }}</text>
						<text class="setting-arrow">></text>
					</view>
				</view>
			</view>
		</view>

		<!-- 通知设置 -->
		<view class="settings-section">
			<view class="section-title">
				<text class="title-text">通知设置</text>
			</view>
			<view class="settings-list">
				<view class="setting-item">
					<view class="setting-content">
						<text class="setting-icon">🔔</text>
						<text class="setting-label">推送通知</text>
					</view>
					<switch :checked="pushNotificationEnabled" @change="onPushNotificationChange" />
				</view>
				<view class="setting-item">
					<view class="setting-content">
						<text class="setting-icon">📧</text>
						<text class="setting-label">邮件通知</text>
					</view>
					<switch :checked="emailNotificationEnabled" @change="onEmailNotificationChange" />
				</view>
				<view class="setting-item">
					<view class="setting-content">
						<text class="setting-icon">📱</text>
						<text class="setting-label">短信通知</text>
					</view>
					<switch :checked="smsNotificationEnabled" @change="onSmsNotificationChange" />
				</view>
			</view>
		</view>

		<!-- 隐私设置 -->
		<view class="settings-section">
			<view class="section-title">
				<text class="title-text">隐私设置</text>
			</view>
			<view class="settings-list">
				<view class="setting-item">
					<view class="setting-content">
						<text class="setting-icon">👁️</text>
						<text class="setting-label">个人信息可见性</text>
					</view>
					<switch :checked="profileVisibilityEnabled" @change="onProfileVisibilityChange" />
				</view>
				<view class="setting-item">
					<view class="setting-content">
						<text class="setting-icon">📊</text>
						<text class="setting-label">数据分析</text>
					</view>
					<switch :checked="dataAnalyticsEnabled" @change="onDataAnalyticsChange" />
				</view>
			</view>
		</view>

		<!-- 应用设置 -->
		<view class="settings-section">
			<view class="section-title">
				<text class="title-text">应用设置</text>
			</view>
			<view class="settings-list">
				<view class="setting-item" @click="selectLanguage">
					<view class="setting-content">
						<text class="setting-icon">🌐</text>
						<text class="setting-label">语言</text>
					</view>
					<view class="setting-value">
						<text class="value-text">{{ currentLanguage }}</text>
						<text class="setting-arrow">></text>
					</view>
				</view>
				<view class="setting-item" @click="selectTheme">
					<view class="setting-content">
						<text class="setting-icon">🎨</text>
						<text class="setting-label">主题</text>
					</view>
					<view class="setting-value">
						<text class="value-text">{{ currentTheme }}</text>
						<text class="setting-arrow">></text>
					</view>
				</view>
				<view class="setting-item" @click="clearCache">
					<view class="setting-content">
						<text class="setting-icon">🗑️</text>
						<text class="setting-label">清除缓存</text>
					</view>
					<view class="setting-value">
						<text class="value-text">{{ cacheSize }}</text>
						<text class="setting-arrow">></text>
					</view>
				</view>
			</view>
		</view>

		<!-- 帮助与支持 -->
		<view class="settings-section">
			<view class="section-title">
				<text class="title-text">帮助与支持</text>
			</view>
			<view class="settings-list">
				<view class="setting-item" @click="showHelp">
					<view class="setting-content">
						<text class="setting-icon">❓</text>
						<text class="setting-label">帮助中心</text>
					</view>
					<text class="setting-arrow">></text>
				</view>
				<view class="setting-item" @click="contactSupport">
					<view class="setting-content">
						<text class="setting-icon">💬</text>
						<text class="setting-label">联系客服</text>
					</view>
					<text class="setting-arrow">></text>
				</view>
				<view class="setting-item" @click="feedback">
					<view class="setting-content">
						<text class="setting-icon">📝</text>
						<text class="setting-label">意见反馈</text>
					</view>
					<text class="setting-arrow">></text>
				</view>
			</view>
		</view>

		<!-- 法律信息 -->
		<view class="settings-section">
			<view class="section-title">
				<text class="title-text">法律信息</text>
			</view>
			<view class="settings-list">
				<view class="setting-item" @click="showPrivacyPolicy">
					<view class="setting-content">
						<text class="setting-icon">🔐</text>
						<text class="setting-label">隐私政策</text>
					</view>
					<text class="setting-arrow">></text>
				</view>
				<view class="setting-item" @click="showUserAgreement">
					<view class="setting-content">
						<text class="setting-icon">📄</text>
						<text class="setting-label">用户协议</text>
					</view>
					<text class="setting-arrow">></text>
				</view>
			</view>
		</view>

		<!-- 退出登录 -->
		<view class="logout-section">
			<button class="logout-btn" @click="logout">退出登录</button>
		</view>

		<!-- 版本信息 -->
		<view class="version-section">
			<text class="version-text">版本 1.0.0</text>
		</view>
	</view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import userService from '../../utils/userUtils.js'

// 响应式数据
const userInfo = ref({
	name: '用户',
	account: '',
	img: '/static/images/DefaultAvatar.png',
	phone: ''
})

// 设置状态
const phoneProtectionEnabled = ref(true)
const pushNotificationEnabled = ref(true)
const emailNotificationEnabled = ref(false)
const smsNotificationEnabled = ref(true)
const profileVisibilityEnabled = ref(true)
const dataAnalyticsEnabled = ref(false)

// 应用设置
const currentLanguage = ref('简体中文')
const currentTheme = ref('默认主题')
const cacheSize = ref('12.5MB')

// 计算属性
const displayPhone = computed(() => {
	if (!userInfo.value.phone) return '未绑定'
	if (phoneProtectionEnabled.value) {
		// 手机号保护：显示为 138****0000
		const phone = userInfo.value.phone
		return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
	}
	return userInfo.value.phone
})

// 页面加载时获取用户信息
onMounted(() => {
	loadUserInfo()
	loadSettings()
})

// 页面显示时刷新用户信息（解决从其他页面返回时数据不更新的问题）
onShow(() => {
	loadUserInfo()
})

// 加载用户信息
async function loadUserInfo() {
	try {
		const currentUser = JSON.parse(uni.getStorageSync('currentUser') || '{}')
		if (currentUser.account) {
			// 先使用本地存储的数据
			userInfo.value = {
				name: currentUser.name || '用户',
				account: currentUser.account || '',
				img: currentUser.img || '/static/images/DefaultAvatar.png',
				phone: currentUser.phone || ''
			}

			// 尝试从后端获取最新的用户信息
			try {
				const users = await userService.getAllUsers()
				const latestUserInfo = users.find(user => user.account === currentUser.account)

				if (latestUserInfo) {
					// 更新用户信息
					const updatedUserInfo = {
						name: latestUserInfo.name || '用户',
						account: latestUserInfo.account || '',
						img: latestUserInfo.img || '/static/images/DefaultAvatar.png',
						phone: latestUserInfo.phone || ''
					}

					userInfo.value = updatedUserInfo

					// 同时更新本地存储中的用户信息
					const updatedCurrentUser = {
						...currentUser,
						...latestUserInfo
					}
					uni.setStorageSync('currentUser', JSON.stringify(updatedCurrentUser))
				}
			} catch (apiError) {
				console.log('从后端获取用户信息失败，使用本地缓存:', apiError.message)
				// 如果API调用失败，继续使用本地存储的数据，不影响用户体验
			}
		}
	} catch (error) {
		console.error('加载用户信息失败:', error)
	}
}

// 加载设置
function loadSettings() {
	try {
		const settings = JSON.parse(uni.getStorageSync('userSettings') || '{}')
		phoneProtectionEnabled.value = settings.phoneProtection !== false
		pushNotificationEnabled.value = settings.pushNotification !== false
		emailNotificationEnabled.value = settings.emailNotification === true
		smsNotificationEnabled.value = settings.smsNotification !== false
		profileVisibilityEnabled.value = settings.profileVisibility !== false
		dataAnalyticsEnabled.value = settings.dataAnalytics === true
		currentLanguage.value = settings.language || '简体中文'
		currentTheme.value = settings.theme || '默认主题'
	} catch (error) {
		console.error('加载设置失败:', error)
	}
}

// 保存设置
function saveSettings() {
	try {
		const settings = {
			phoneProtection: phoneProtectionEnabled.value,
			pushNotification: pushNotificationEnabled.value,
			emailNotification: emailNotificationEnabled.value,
			smsNotification: smsNotificationEnabled.value,
			profileVisibility: profileVisibilityEnabled.value,
			dataAnalytics: dataAnalyticsEnabled.value,
			language: currentLanguage.value,
			theme: currentTheme.value
		}
		uni.setStorageSync('userSettings', JSON.stringify(settings))
	} catch (error) {
		console.error('保存设置失败:', error)
	}
}

// 刷新用户信息
async function refreshUserInfo() {
	uni.showLoading({
		title: '刷新中...'
	})

	try {
		await loadUserInfo()
		uni.hideLoading()
		uni.showToast({
			title: '刷新成功',
			icon: 'success'
		})
	} catch (error) {
		uni.hideLoading()
		uni.showToast({
			title: '刷新失败',
			icon: 'none'
		})
	}
}

// 编辑个人资料
function editProfile() {
	uni.navigateTo({
		url: '/pages/EditProfile/EditProfile'
	})
}

// 修改密码
function changePassword() {
	uni.showModal({
		title: '修改密码',
		content: '是否跳转到登录页面进行密码修改？',
		success: (res) => {
			if (res.confirm) {
				uni.navigateTo({
					url: '/pages/LoginPage/LoginPage'
				})
			}
		}
	})
}

// 绑定手机号
function bindPhone() {
	uni.showToast({
		title: '手机号绑定功能开发中',
		icon: 'none'
	})
}

// 手机号保护开关
function togglePhoneProtection() {
	phoneProtectionEnabled.value = !phoneProtectionEnabled.value
	saveSettings()
}

function onPhoneProtectionChange(e) {
	phoneProtectionEnabled.value = e.detail.value
	saveSettings()
}

// 通知设置开关
function onPushNotificationChange(e) {
	pushNotificationEnabled.value = e.detail.value
	saveSettings()
	uni.showToast({
		title: pushNotificationEnabled.value ? '已开启推送通知' : '已关闭推送通知',
		icon: 'none'
	})
}

function onEmailNotificationChange(e) {
	emailNotificationEnabled.value = e.detail.value
	saveSettings()
}

function onSmsNotificationChange(e) {
	smsNotificationEnabled.value = e.detail.value
	saveSettings()
}

// 隐私设置开关
function onProfileVisibilityChange(e) {
	profileVisibilityEnabled.value = e.detail.value
	saveSettings()
}

function onDataAnalyticsChange(e) {
	dataAnalyticsEnabled.value = e.detail.value
	saveSettings()
	uni.showToast({
		title: dataAnalyticsEnabled.value ? '已开启数据分析' : '已关闭数据分析',
		icon: 'none'
	})
}

// 语言选择
function selectLanguage() {
	uni.showActionSheet({
		itemList: ['简体中文', 'English', '繁體中文'],
		success: (res) => {
			const languages = ['简体中文', 'English', '繁體中文']
			currentLanguage.value = languages[res.tapIndex]
			saveSettings()
			uni.showToast({
				title: `已切换到${currentLanguage.value}`,
				icon: 'success'
			})
		}
	})
}

// 主题选择
function selectTheme() {
	uni.showActionSheet({
		itemList: ['默认主题', '深色主题', '护眼主题'],
		success: (res) => {
			const themes = ['默认主题', '深色主题', '护眼主题']
			currentTheme.value = themes[res.tapIndex]
			saveSettings()
			uni.showToast({
				title: `已切换到${currentTheme.value}`,
				icon: 'success'
			})
		}
	})
}

// 清除缓存
function clearCache() {
	uni.showModal({
		title: '清除缓存',
		content: '确定要清除应用缓存吗？这将删除临时文件和图片缓存。',
		success: (res) => {
			if (res.confirm) {
				// 模拟清除缓存
				setTimeout(() => {
					cacheSize.value = '0MB'
					uni.showToast({
						title: '缓存清除成功',
						icon: 'success'
					})
					// 3秒后恢复显示
					setTimeout(() => {
						cacheSize.value = '12.5MB'
					}, 3000)
				}, 1000)
			}
		}
	})
}

// 帮助中心
function showHelp() {
	uni.showToast({
		title: '帮助中心功能开发中',
		icon: 'none'
	})
}

// 联系客服
function contactSupport() {
	uni.makePhoneCall({
		phoneNumber: '400-888-0000',
		fail: () => {
			uni.showToast({
				title: '拨打失败',
				icon: 'none'
			})
		}
	})
}

// 意见反馈
function feedback() {
	uni.showToast({
		title: '意见反馈功能开发中',
		icon: 'none'
	})
}

// 显示隐私政策
function showPrivacyPolicy() {
	uni.showModal({
		title: '隐私政策',
		content: 'OwOTicket隐私政策\n\n我们非常重视您的隐私保护，本政策说明我们如何收集、使用和保护您的个人信息。\n\n1. 信息收集\n我们可能收集以下信息：\n• 注册信息：姓名、手机号、邮箱等\n• 使用信息：浏览记录、订单信息等\n• 设备信息：设备型号、操作系统等\n\n2. 信息使用\n我们使用您的信息用于：\n• 提供和改善我们的服务\n• 处理您的订单和支付\n• 发送重要通知和服务更新\n\n详细的隐私政策请访问我们的官方网站查看。',
		showCancel: false,
		confirmText: '我知道了'
	})
}

// 显示用户协议
function showUserAgreement() {
	uni.showModal({
		title: '用户协议',
		content: '欢迎使用OwOTicket服务！\n\n1. 服务条款\n通过注册和使用我们的服务，您同意遵守以下条款：\n• 您必须年满18周岁或在法定监护人同意下使用本服务\n• 您承诺提供真实、准确的个人信息\n• 您不得利用本服务进行任何违法或不当行为\n\n2. 账户责任\n• 您有责任保护您的账户安全\n• 您对使用您账户进行的所有活动负责\n\n详细的用户协议请访问我们的官方网站查看。',
		showCancel: false,
		confirmText: '我知道了'
	})
}

// 退出登录
function logout() {
	uni.showModal({
		title: '退出登录',
		content: '确定要退出登录吗？',
		success: (res) => {
			if (res.confirm) {
				// 清除登录状态
				uni.removeStorageSync('token')
				uni.removeStorageSync('currentUser')

				uni.showToast({
					title: '已退出登录',
					icon: 'success'
				})

				// 跳转到登录页面
				setTimeout(() => {
					uni.redirectTo({
						url: '/pages/LoginPage/LoginPage'
					})
				}, 1500)
			}
		}
	})
}
</script>

<style scoped>
.container {
	background-color: #f5f5f5;
	min-height: 100vh;
	padding-bottom: 40rpx;
}

/* 用户信息区域 */
.user-section {
	background-color: white;
	margin-bottom: 20rpx;
	padding: 40rpx 30rpx;
}

.user-info {
	display: flex;
	align-items: center;
	gap: 20rpx;
}

.user-avatar {
	width: 120rpx;
	height: 120rpx;
	border-radius: 60rpx;
	flex-shrink: 0;
}

.user-details {
	flex: 1;
}

.user-name {
	display: block;
	font-size: 32rpx;
	font-weight: 600;
	color: #333;
	margin-bottom: 10rpx;
}

.user-account {
	font-size: 26rpx;
	color: #666;
}

.action-buttons {
	display: flex;
	gap: 15rpx;
}

.action-btn {
	font-size: 26rpx;
	padding: 10rpx 20rpx;
	border-radius: 20rpx;
	cursor: pointer;
	transition: all 0.3s ease;
}

.edit-btn {
	color: #36cfc9;
	border: 2rpx solid #36cfc9;
}

.edit-btn:active {
	background-color: #36cfc9;
	color: white;
}

.refresh-btn {
	color: #52c41a;
	border: 2rpx solid #52c41a;
}

.refresh-btn:active {
	background-color: #52c41a;
	color: white;
}

/* 设置区块 */
.settings-section {
	background-color: white;
	margin-bottom: 20rpx;
	padding: 0 30rpx;
}

.section-title {
	padding: 30rpx 0 20rpx;
	border-bottom: 2rpx solid #f0f0f0;
}

.title-text {
	font-size: 32rpx;
	font-weight: 600;
	color: #333;
}

.settings-list {
	padding: 20rpx 0;
}

.setting-item {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 25rpx 0;
	border-bottom: 1rpx solid #f5f5f5;
	cursor: pointer;
}

.setting-item:last-child {
	border-bottom: none;
}

.setting-content {
	display: flex;
	align-items: center;
	gap: 20rpx;
	flex: 1;
}

.setting-icon {
	font-size: 32rpx;
	width: 40rpx;
	text-align: center;
}

.setting-label {
	font-size: 28rpx;
	color: #333;
}

.setting-value {
	display: flex;
	align-items: center;
	gap: 10rpx;
}

.value-text {
	font-size: 26rpx;
	color: #666;
}

.phone-display {
	font-size: 26rpx;
	color: #666;
}

.setting-arrow {
	font-size: 28rpx;
	color: #ccc;
}

/* 退出登录区域 */
.logout-section {
	padding: 40rpx 30rpx;
}

.logout-btn {
	width: 100%;
	height: 88rpx;
	background-color: #ff4d4f;
	color: white;
	border: none;
	border-radius: 12rpx;
	font-size: 32rpx;
	font-weight: 600;
	display: flex;
	align-items: center;
	justify-content: center;
}

.logout-btn:active {
	background-color: #d9363e;
}

/* 版本信息 */
.version-section {
	text-align: center;
	padding: 20rpx;
}

.version-text {
	font-size: 24rpx;
	color: #999;
}

/* Switch组件样式调整 */
switch {
	transform: scale(0.8);
}

/* 响应式设计 */
@media screen and (max-width: 750rpx) {
	.container {
		padding: 0 20rpx;
	}

	.user-section,
	.settings-section {
		margin-left: -20rpx;
		margin-right: -20rpx;
		padding-left: 30rpx;
		padding-right: 30rpx;
	}
}
</style>
