<template>
	<view class="container">
		<!-- 顶部Logo区域 -->
		<view class="header-section">
			<image src="/static/images/OwO_logo.png" class="app-logo" mode="aspectFit"></image>
			<text class="app-name">OwOTicket</text>
			<text class="app-version">版本 1.0.0</text>
		</view>

		<!-- 应用介绍 -->
		<view class="intro-section">
			<view class="section-title">
				<text class="title-text">应用介绍</text>
			</view>
			<view class="intro-content">
				<text class="intro-text">
					OwOTicket 是一款专为旅游爱好者打造的综合性票务服务平台。我们致力于为用户提供便捷、安全、优质的门票预订、住宿安排和纪念品购买服务。
				</text>
				<text class="intro-text">
					通过我们的平台，您可以轻松预订各类景点门票、精选住宿和特色纪念品，让您的每一次旅行都充满美好回忆。
				</text>
			</view>
		</view>

		<!-- 核心功能 -->
		<view class="features-section">
			<view class="section-title">
				<text class="title-text">核心功能</text>
			</view>
			<view class="features-list">
				<view class="feature-item">
					<image src="/static/images/ticket.png" class="feature-icon"></image>
					<view class="feature-content">
						<text class="feature-title">门票预订</text>
						<text class="feature-desc">多样化门票选择，支持在线预订和即时出票</text>
					</view>
				</view>
				<view class="feature-item">
					<image src="/static/images/stay.png" class="feature-icon"></image>
					<view class="feature-content">
						<text class="feature-title">住宿服务</text>
						<text class="feature-desc">精选优质住宿，从经济型到豪华型应有尽有</text>
					</view>
				</view>
				<view class="feature-item">
					<image src="/static/images/souvenir.png" class="feature-icon"></image>
					<view class="feature-content">
						<text class="feature-title">纪念品商城</text>
						<text class="feature-desc">特色纪念品，留住美好旅行回忆</text>
					</view>
				</view>
				<view class="feature-item">
					<image src="/static/images/service.png" class="feature-icon"></image>
					<view class="feature-content">
						<text class="feature-title">贴心服务</text>
						<text class="feature-desc">7×24小时客服支持，让您的旅行无忧</text>
					</view>
				</view>
			</view>
		</view>

		<!-- 团队介绍 -->
		<view class="team-section">
			<view class="section-title">
				<text class="title-text">团队介绍</text>
			</view>
			<view class="team-content">
				<text class="team-text">
					我们是一支充满激情的年轻团队，专注于为用户提供最优质的旅游服务体验。团队成员来自技术、设计、运营等多个领域，共同致力于打造更好的旅游服务平台。
				</text>
			</view>
		</view>

		<!-- 联系我们 -->
		<view class="contact-section">
			<view class="section-title">
				<text class="title-text">联系我们</text>
			</view>
			<view class="contact-list">
				<view class="contact-item" @click="callPhone">
					<text class="contact-label">客服热线</text>
					<text class="contact-value">400-888-0000</text>
				</view>
				<view class="contact-item" @click="copyEmail">
					<text class="contact-label">邮箱地址</text>
					<text class="contact-value">2507067216@qq.com</text>
				</view>
				<view class="contact-item">
					<text class="contact-label">工作时间</text>
					<text class="contact-value">周一至周日 9:00-21:00</text>
				</view>
				<view class="contact-item">
					<text class="contact-label">公司地址</text>
					<text class="contact-value">江西省南昌市南昌县天庭南天门</text>
				</view>
			</view>
		</view>

		<!-- 法律信息 -->
		<view class="legal-section">
			<view class="section-title">
				<text class="title-text">法律信息</text>
			</view>
			<view class="legal-links">
				<text class="legal-link" @click="showPrivacyPolicy">隐私政策</text>
				<text class="legal-divider">|</text>
				<text class="legal-link" @click="showUserAgreement">用户协议</text>
				<text class="legal-divider">|</text>
				<text class="legal-link" @click="showServiceTerms">服务条款</text>
			</view>
		</view>

		<!-- 版权信息 -->
		<view class="copyright-section">
			<text class="copyright-text">© 2024 OwOTicket. All rights reserved.</text>
			<text class="copyright-text">江西OwO科技有限公司</text>
		</view>
	</view>
</template>

<script setup>
// 拨打客服电话
function callPhone() {
	uni.makePhoneCall({
		phoneNumber: '400-888-0000',
		fail: (err) => {
			console.error('拨打电话失败:', err)
			uni.showToast({
				title: '拨打失败',
				icon: 'none'
			})
		}
	})
}

// 复制邮箱地址
function copyEmail() {
	uni.setClipboardData({
		data: '2507067216@qq.com',
		success: () => {
			uni.showToast({
				title: '邮箱地址已复制',
				icon: 'success'
			})
		},
		fail: () => {
			uni.showToast({
				title: '复制失败',
				icon: 'none'
			})
		}
	})
}

// 显示隐私政策
function showPrivacyPolicy() {
	uni.showModal({
		title: '隐私政策',
		content: '我们非常重视您的隐私保护。我们承诺严格保护您的个人信息安全，不会未经您的同意向第三方披露您的个人信息。详细的隐私政策请访问我们的官方网站查看。',
		showCancel: false,
		confirmText: '我知道了'
	})
}

// 显示用户协议
function showUserAgreement() {
	uni.showModal({
		title: '用户协议',
		content: '欢迎使用OwOTicket服务！请您仔细阅读并充分理解本协议的各项条款。使用我们的服务即表示您同意遵守本协议的所有条款和条件。',
		showCancel: false,
		confirmText: '我知道了'
	})
}

// 显示服务条款
function showServiceTerms() {
	uni.showModal({
		title: '服务条款',
		content: '本服务条款规定了您使用OwOTicket服务的权利和义务。我们保留随时修改服务条款的权利，修改后的条款将在应用内公布。',
		showCancel: false,
		confirmText: '我知道了'
	})
}
</script>

<style scoped>
.container {
	background-color: #f5f5f5;
	min-height: 100vh;
	padding-bottom: 40rpx;
}

/* 顶部Logo区域 */
.header-section {
	background: linear-gradient(135deg, #36cfc9 0%, #52c41a 100%);
	padding: 80rpx 40rpx 60rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
	color: white;
}

.app-logo {
	width: 120rpx;
	height: 120rpx;
	margin-bottom: 20rpx;
	border-radius: 24rpx;
	background-color: rgba(255, 255, 255, 0.1);
	padding: 20rpx;
}

.app-name {
	font-size: 48rpx;
	font-weight: 700;
	margin-bottom: 10rpx;
}

.app-version {
	font-size: 28rpx;
	opacity: 0.8;
}

/* 通用区块样式 */
.intro-section,
.features-section,
.team-section,
.contact-section,
.legal-section {
	background-color: white;
	margin: 20rpx 30rpx;
	border-radius: 16rpx;
	padding: 40rpx 30rpx;
	box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
}

.section-title {
	margin-bottom: 30rpx;
	padding-bottom: 20rpx;
	border-bottom: 2rpx solid #f0f0f0;
}

.title-text {
	font-size: 32rpx;
	font-weight: 600;
	color: #333;
}

/* 应用介绍 */
.intro-content {
	line-height: 1.6;
}

.intro-text {
	display: block;
	font-size: 28rpx;
	color: #666;
	margin-bottom: 20rpx;
	line-height: 1.8;
}

/* 核心功能 */
.features-list {
	display: flex;
	flex-direction: column;
	gap: 30rpx;
}

.feature-item {
	display: flex;
	align-items: flex-start;
	gap: 20rpx;
}

.feature-icon {
	width: 60rpx;
	height: 60rpx;
	flex-shrink: 0;
}

.feature-content {
	flex: 1;
}

.feature-title {
	display: block;
	font-size: 30rpx;
	font-weight: 600;
	color: #333;
	margin-bottom: 8rpx;
}

.feature-desc {
	font-size: 26rpx;
	color: #666;
	line-height: 1.6;
}

/* 团队介绍 */
.team-content {
	line-height: 1.6;
}

.team-text {
	font-size: 28rpx;
	color: #666;
	line-height: 1.8;
}

/* 联系我们 */
.contact-list {
	display: flex;
	flex-direction: column;
	gap: 25rpx;
}

.contact-item {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 20rpx 0;
	border-bottom: 1rpx solid #f5f5f5;
}

.contact-item:last-child {
	border-bottom: none;
}

.contact-label {
	font-size: 28rpx;
	color: #333;
	font-weight: 500;
}

.contact-value {
	font-size: 28rpx;
	color: #36cfc9;
	font-weight: 500;
}

/* 法律信息 */
.legal-links {
	display: flex;
	justify-content: center;
	align-items: center;
	gap: 20rpx;
}

.legal-link {
	font-size: 26rpx;
	color: #36cfc9;
	text-decoration: underline;
}

.legal-divider {
	font-size: 26rpx;
	color: #ccc;
}

/* 版权信息 */
.copyright-section {
	text-align: center;
	padding: 40rpx 30rpx;
	margin-top: 20rpx;
}

.copyright-text {
	display: block;
	font-size: 24rpx;
	color: #999;
	margin-bottom: 8rpx;
}
</style>
