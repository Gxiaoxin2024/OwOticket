<template>
	<view class="container">
		<!-- 登录注册页面 -->
		<view class="login-container">
			<!-- Logo区域 - 注册和忘记密码时隐藏 -->
			<view class="logo-section" v-if="currentTab === 'login'">
				<image src="/static/images/OwO_logo.png" class="logo" mode="aspectFit"></image>
				<text class="app-name">OwOTicket</text>
				<text class="app-subtitle">欢迎来到OwO俱乐部</text>
			</view>

			<!-- 表单区域 -->
			<view class="form-section">
				<!-- Tab切换 - 忘记密码时隐藏 -->
				<view class="tab-container" v-if="currentTab !== 'forgot'">
					<view class="tab-item" :class="{ active: currentTab === 'login' }" @click="switchTab('login')">
						<text class="tab-text">登录</text>
					</view>
					<view class="tab-item" :class="{ active: currentTab === 'register' }" @click="switchTab('register')">
						<text class="tab-text">注册</text>
					</view>
					<!-- 滑动指示条 -->
					<view class="tab-indicator" :style="{ left: indicatorPosition }"></view>
				</view>

				<!-- 忘记密码标题 -->
				<view class="forgot-title" v-if="currentTab === 'forgot'">
					<text class="title-text">重置密码</text>
					<text class="subtitle-text">请输入账号和手机号验证身份</text>
				</view>

				<!-- 登录表单 -->
				<view v-if="currentTab === 'login'" class="form-content">
					<view class="input-group">
						<view class="input-item">
							<text class="input-label">账号</text>
							<input class="input-field" type="text" v-model="loginForm.account" placeholder="请输入手机号或账号"
								maxlength="20" />
						</view>
						<view class="input-item">
							<text class="input-label">密码</text>
							<input class="input-field" :type="showPassword ? 'text' : 'password'" v-model="loginForm.password"
								placeholder="请输入密码" maxlength="20" />
							<text class="password-toggle" @click="togglePassword">
								{{ showPassword ? '隐藏' : '显示' }}
							</text>
						</view>
					</view>

					<button class="submit-btn" @click="handleLogin" :disabled="!canLogin">
						登录
					</button>

					<view class="form-footer">
						<text class="forgot-password" @click="forgotPassword">忘记密码？</text>
					</view>
				</view>

				<!-- 注册表单 -->
				<view v-if="currentTab === 'register'" class="form-content">
					<view class="input-group">
						<view class="input-item">
							<text class="input-label">账号</text>
							<input class="input-field" type="text" v-model="registerForm.account" placeholder="请输入账号（6位以上，至少一个英文）"
								maxlength="20" />
						</view>
						<view class="input-item">
							<text class="input-label">手机号</text>
							<view class="phone-input-container">
								<input class="input-field phone-input" type="number" v-model="registerForm.phone" placeholder="请输入手机号"
									maxlength="11" />
								<button class="verify-btn" @click="getVerificationCode" :disabled="!canGetCode">
									{{ codeButtonText }}
								</button>
							</view>
						</view>
						<view class="input-item">
							<text class="input-label">验证码</text>
							<input class="input-field" type="number" v-model="registerForm.verificationCode" placeholder="请输入验证码"
								maxlength="6" />
						</view>
						<view class="input-item">
							<text class="input-label">密码</text>
							<input class="input-field" :type="showRegPassword ? 'text' : 'password'" v-model="registerForm.password"
								placeholder="请输入密码（6-20位）" maxlength="20" />
							<text class="password-toggle" @click="toggleRegPassword">
								{{ showRegPassword ? '隐藏' : '显示' }}
							</text>
						</view>
						<view class="input-item">
							<text class="input-label">确认密码</text>
							<input class="input-field" :type="showConfirmPassword ? 'text' : 'password'"
								v-model="registerForm.confirmPassword" placeholder="请再次输入密码" maxlength="20" />
							<text class="password-toggle" @click="toggleConfirmPassword">
								{{ showConfirmPassword ? '隐藏' : '显示' }}
							</text>
						</view>
					</view>

					<view class="agreement-section">
						<checkbox-group @change="onAgreementChange">
							<label class="agreement-label">
								<checkbox value="agree" :checked="registerForm.agreed" />
								<text class="agreement-text">我已阅读并同意</text>
								<text class="agreement-link" @click="showUserAgreement">《用户协议》</text>
								<text class="agreement-text">和</text>
								<text class="agreement-link" @click="showPrivacyPolicy">《隐私政策》</text>
							</label>
						</checkbox-group>
					</view>

					<button class="submit-btn" @click="handleRegister" :disabled="!canRegister">
						注册
					</button>
				</view>

				<!-- 忘记密码表单 -->
				<view v-if="currentTab === 'forgot'" class="form-content">
					<view class="input-group">
						<view class="input-item">
							<text class="input-label">账号</text>
							<input class="input-field" type="text" v-model="forgotPasswordForm.account" placeholder="请输入账号"
								maxlength="20" />
						</view>
						<view class="input-item">
							<text class="input-label">手机号</text>
							<view class="phone-input-container">
								<input class="input-field phone-input" type="number" v-model="forgotPasswordForm.phone"
									placeholder="请输入手机号" maxlength="11" />
								<button class="verify-btn" @click="getForgotVerificationCode" :disabled="!canGetForgotCode">
									{{ codeButtonText }}
								</button>
							</view>
						</view>
						<view class="input-item">
							<text class="input-label">验证码</text>
							<input class="input-field" type="number" v-model="forgotPasswordForm.verificationCode"
								placeholder="请输入验证码" maxlength="6" />
						</view>
						<view class="input-item">
							<text class="input-label">新密码</text>
							<input class="input-field" :type="showForgotPassword ? 'text' : 'password'"
								v-model="forgotPasswordForm.newPassword" placeholder="请输入新密码（6-20位）" maxlength="20" />
							<text class="password-toggle" @click="toggleForgotPassword">
								{{ showForgotPassword ? '隐藏' : '显示' }}
							</text>
						</view>
						<view class="input-item">
							<text class="input-label">确认密码</text>
							<input class="input-field" :type="showForgotConfirmPassword ? 'text' : 'password'"
								v-model="forgotPasswordForm.confirmPassword" placeholder="请再次输入新密码" maxlength="20" />
							<text class="password-toggle" @click="toggleForgotConfirmPassword">
								{{ showForgotConfirmPassword ? '隐藏' : '显示' }}
							</text>
						</view>
					</view>

					<button class="submit-btn" @click="handleResetPassword" :disabled="!canResetPassword">
						重置密码
					</button>

					<view class="form-footer">
						<text class="back-to-login" @click="backToLogin">返回登录</text>
					</view>
				</view>
			</view>
		</view>

		<!-- 验证码弹窗 -->
		<view class="modal-overlay" v-if="showCodeModal" @click="closeCodeModal">
			<view class="code-modal" @click.stop>
				<view class="modal-header">
					<text class="modal-title">验证码验证</text>
					<text class="modal-close" @click="closeCodeModal">×</text>
				</view>
				<view class="modal-content">
					<text class="modal-text">验证码已发送至</text>
					<text class="modal-phone">{{ maskedPhone }}</text>
					<text class="modal-text">请查收并输入验证码</text>

					<view class="code-display">
						<text class="code-label">模拟验证码：</text>
						<text class="code-value">{{ currentVerificationCode }}</text>
					</view>

					<view class="modal-tips">
						<text class="tip-text">• 验证码有效期5分钟</text>
						<text class="tip-text">• 请勿向他人泄露验证码</text>
					</view>
				</view>
				<view class="modal-footer">
					<button class="modal-btn confirm-btn" @click="confirmCode">确定</button>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import {
	ref,
	computed
} from 'vue'
import {
	onLoad
} from '@dcloudio/uni-app'
import userService from '../../utils/userUtils.js'

// 响应式数据
const currentTab = ref('login') // 当前选中的tab
const showPassword = ref(false) // 登录密码显示状态
const showRegPassword = ref(false) // 注册密码显示状态
const showConfirmPassword = ref(false) // 确认密码显示状态
const showForgotPassword = ref(false) // 忘记密码新密码显示状态
const showForgotConfirmPassword = ref(false) // 忘记密码确认密码显示状态

// 登录表单数据
const loginForm = ref({
	account: '',
	password: ''
})

// 注册表单数据
const registerForm = ref({
	account: '',
	phone: '',
	verificationCode: '',
	password: '',
	confirmPassword: '',
	agreed: false
})

// 忘记密码表单数据
const forgotPasswordForm = ref({
	account: '',
	phone: '',
	verificationCode: '',
	newPassword: '',
	confirmPassword: ''
})

// 验证码相关数据
const showCodeModal = ref(false) // 是否显示验证码弹窗
const currentVerificationCode = ref('') // 当前验证码
const codeCountdown = ref(0) // 倒计时秒数
const codeTimer = ref(null) // 倒计时定时器

// 计算指示条位置
const indicatorPosition = computed(() => {
	if (currentTab.value === 'login') return '25%'
	if (currentTab.value === 'register') return '75%'
	return '25%' // 忘记密码时隐藏Tab，默认位置
})

// 检查登录表单是否可提交
const canLogin = computed(() => {
	return loginForm.value.account.trim() && loginForm.value.password.trim()
})

// 检查注册表单是否可提交
const canRegister = computed(() => {
	return registerForm.value.account.trim() &&
		registerForm.value.phone.trim() &&
		registerForm.value.verificationCode.trim() &&
		registerForm.value.password.trim() &&
		registerForm.value.confirmPassword.trim() &&
		registerForm.value.agreed
})

// 检查忘记密码表单是否可提交
const canResetPassword = computed(() => {
	return forgotPasswordForm.value.account.trim() &&
		forgotPasswordForm.value.phone.trim() &&
		forgotPasswordForm.value.verificationCode.trim() &&
		forgotPasswordForm.value.newPassword.trim() &&
		forgotPasswordForm.value.confirmPassword.trim()
})

// 检查是否可以获取验证码（注册）
const canGetCode = computed(() => {
	return registerForm.value.phone.trim().length === 11 && codeCountdown.value === 0
})

// 检查是否可以获取验证码（忘记密码）
const canGetForgotCode = computed(() => {
	return forgotPasswordForm.value.phone.trim().length === 11 && codeCountdown.value === 0
})

// 验证码按钮文字
const codeButtonText = computed(() => {
	return codeCountdown.value > 0 ? `${codeCountdown.value}s后重发` : '获取验证码'
})

// 脱敏手机号
const maskedPhone = computed(() => {
	const phone = registerForm.value.phone
	if (phone.length === 11) {
		return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
	}
	return phone
})

// 页面加载时检查是否已登录
onLoad(async () => {
	checkLoginStatus()

	// 测试后端连接
	try {
		const isConnected = await userService.testConnection()
		console.log('后端连接状态:', isConnected ? '正常' : '失败')

		if (!isConnected) {
			console.warn('后端服务不可用，将使用备用登录方案')
		}
	} catch (error) {
		console.error('连接测试失败:', error)
	}
})

// 检查登录状态
function checkLoginStatus() {
	try {
		const token = uni.getStorageSync('token')
		if (token) {
			// 已登录，跳转到首页
			uni.switchTab({
				url: '/pages/index/index'
			})
		}
	} catch (e) {
		console.log('检查登录状态失败:', e)
	}
}

// 切换tab
function switchTab(tab) {
	currentTab.value = tab
	// 清空表单数据
	if (tab === 'login') {
		loginForm.value = {
			account: '',
			password: ''
		}
	} else {
		registerForm.value = {
			account: '',
			phone: '',
			verificationCode: '',
			password: '',
			confirmPassword: '',
			agreed: false
		}
		// 重置验证码相关状态
		resetCodeState()
	}
}

// 切换密码显示状态
function togglePassword() {
	showPassword.value = !showPassword.value
}

function toggleRegPassword() {
	showRegPassword.value = !showRegPassword.value
}

function toggleConfirmPassword() {
	showConfirmPassword.value = !showConfirmPassword.value
}

// 切换忘记密码新密码显示状态
function toggleForgotPassword() {
	showForgotPassword.value = !showForgotPassword.value
}

// 切换忘记密码确认密码显示状态
function toggleForgotConfirmPassword() {
	showForgotConfirmPassword.value = !showForgotConfirmPassword.value
}

// 协议同意状态变化
function onAgreementChange(e) {
	registerForm.value.agreed = e.detail.value.includes('agree')
}

// 重置验证码状态
function resetCodeState() {
	showCodeModal.value = false
	currentVerificationCode.value = ''
	codeCountdown.value = 0
	if (codeTimer.value) {
		clearInterval(codeTimer.value)
		codeTimer.value = null
	}
}

// 获取验证码（注册）
function getVerificationCode() {
	if (!canGetCode.value) {
		return
	}

	// 验证手机号格式
	if (!validatePhone(registerForm.value.phone)) {
		uni.showToast({
			title: '请输入正确的手机号',
			icon: 'none'
		})
		return
	}

	// 生成6位随机验证码
	const code = Math.floor(100000 + Math.random() * 900000).toString()
	currentVerificationCode.value = code

	// 显示验证码弹窗
	showCodeModal.value = true

	// 开始倒计时
	startCountdown()

	// 模拟发送验证码
	uni.showToast({
		title: '验证码已发送',
		icon: 'success'
	})
}

// 获取验证码（忘记密码）
function getForgotVerificationCode() {
	if (!canGetForgotCode.value) {
		return
	}

	// 验证手机号格式
	if (!validatePhone(forgotPasswordForm.value.phone)) {
		uni.showToast({
			title: '请输入正确的手机号',
			icon: 'none'
		})
		return
	}

	// 生成6位随机验证码
	const code = Math.floor(100000 + Math.random() * 900000).toString()
	currentVerificationCode.value = code

	// 显示验证码弹窗
	showCodeModal.value = true

	// 开始倒计时
	startCountdown()

	// 模拟发送验证码
	uni.showToast({
		title: '验证码已发送',
		icon: 'success'
	})
}

// 开始倒计时
function startCountdown() {
	codeCountdown.value = 60
	codeTimer.value = setInterval(() => {
		codeCountdown.value--
		if (codeCountdown.value <= 0) {
			clearInterval(codeTimer.value)
			codeTimer.value = null
		}
	}, 1000)
}

// 关闭验证码弹窗
function closeCodeModal() {
	showCodeModal.value = false
}

// 确认验证码
function confirmCode() {
	showCodeModal.value = false
	uni.showToast({
		title: '请在注册表单中输入验证码',
		icon: 'none'
	})
}

// 生成随机5位数
function generateRandomNumber() {
	return Math.floor(10000 + Math.random() * 90000)
}

// 生成用户token
function generateToken(userId) {
	return `token_${userId}_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
}

// 手机号验证
function validatePhone(phone) {
	const phoneRegex = /^1[3-9]\d{9}$/
	return phoneRegex.test(phone)
}

// 密码验证
function validatePassword(password) {
	return password.length >= 6 && password.length <= 20
}

// 账号验证
function validateAccount(account) {
	// 账号要求：大于或等于6个字符，可以全英文但不能全数字，最少一个英文
	if (account.length < 6) {
		return { valid: false, message: '账号长度不能少于6个字符' }
	}

	// 检查是否包含英文字母
	const hasLetter = /[a-zA-Z]/.test(account)
	if (!hasLetter) {
		return { valid: false, message: '账号必须包含至少一个英文字母' }
	}

	// 检查是否全为数字
	const isAllNumbers = /^\d+$/.test(account)
	if (isAllNumbers) {
		return { valid: false, message: '账号不能全为数字' }
	}

	// 检查是否只包含字母和数字
	const isValidFormat = /^[a-zA-Z0-9]+$/.test(account)
	if (!isValidFormat) {
		return { valid: false, message: '账号只能包含英文字母和数字' }
	}

	return { valid: true, message: '账号格式正确' }
}

// 验证码验证
function validateVerificationCode(inputCode) {
	// 检查验证码是否为6位数字
	if (!/^\d{6}$/.test(inputCode)) {
		return false
	}

	// 检查验证码是否正确
	if (inputCode !== currentVerificationCode.value) {
		return false
	}

	// 检查验证码是否过期（这里简化处理，实际应用中需要检查时间）
	if (!currentVerificationCode.value) {
		return false
	}

	return true
}

// 验证重置密码表单
function validateResetPasswordForm() {
	const form = forgotPasswordForm.value

	// 验证账号
	if (!form.account.trim()) {
		return { isValid: false, message: '请输入账号' }
	}

	// 验证手机号
	if (!form.phone.trim()) {
		return { isValid: false, message: '请输入手机号' }
	}
	if (!validatePhone(form.phone)) {
		return { isValid: false, message: '请输入正确的手机号格式' }
	}

	// 验证验证码
	if (!form.verificationCode.trim()) {
		return { isValid: false, message: '请输入验证码' }
	}

	// 验证新密码
	if (!form.newPassword.trim()) {
		return { isValid: false, message: '请输入新密码' }
	}
	if (form.newPassword.length < 6 || form.newPassword.length > 20) {
		return { isValid: false, message: '密码长度必须在6-20位之间' }
	}

	// 验证确认密码
	if (!form.confirmPassword.trim()) {
		return { isValid: false, message: '请输入确认密码' }
	}
	if (form.newPassword !== form.confirmPassword) {
		return { isValid: false, message: '两次输入的密码不一致' }
	}

	return { isValid: true }
}

// 处理登录
async function handleLogin() {
	if (!canLogin.value) {
		uni.showToast({
			title: '请填写完整信息',
			icon: 'none'
		})
		return
	}

	try {
		console.log('开始登录流程，账号:', loginForm.value.account)

		// 优化登录策略：直接使用getAllUsers获取用户信息进行验证
		// 这样可以避免loginUser API的问题，同时获取完整的用户信息
		const user = await getUserForLogin(loginForm.value.account, loginForm.value.password)

		if (user) {
			console.log('登录验证成功，用户:', user.account)

			// 确保用户数据包含购物车信息
			const completeUser = await ensureUserCartData(user)

			// 登录成功，生成并存储token
			const token = generateToken(completeUser.id || completeUser.account)
			uni.setStorageSync('token', token)
			uni.setStorageSync('currentUser', JSON.stringify(completeUser))

			uni.showToast({
				title: '登录成功',
				icon: 'success'
			})

			// 延迟跳转到首页
			setTimeout(() => {
				uni.switchTab({
					url: '/pages/index/index'
				})
			}, 1500)
		} else {
			console.log('登录验证失败：账号或密码错误')
			uni.showToast({
				title: '账号或密码错误',
				icon: 'none'
			})
		}
	} catch (error) {
		console.error('登录失败:', error)

		// 提供友好的错误提示
		if (error.message.includes('fetch') || error.message.includes('网络')) {
			uni.showToast({
				title: '网络连接失败，请检查网络',
				icon: 'none'
			})
		} else if (error.message.includes('账号或密码错误')) {
			uni.showToast({
				title: '账号或密码错误',
				icon: 'none'
			})
		} else {
			uni.showToast({
				title: '登录失败，请重试',
				icon: 'none'
			})
		}
	}
}

// 获取用户进行登录验证（优化版本）
async function getUserForLogin(account, password) {
	try {
		// console.log('获取用户信息进行登录验证')

		// 首先尝试通过getAllUsers API获取用户列表
		const users = await userService.getAllUsers()
		// console.log('从API获取到用户列表:', users.length, '个用户')

		// 查找匹配的用户（支持账号或手机号登录）
		const user = users.find(u => {
			const accountMatch = u.account === account || u.phone === account
			const passwordMatch = u.password === password
			return accountMatch && passwordMatch
		})

		if (user) {
			// console.log('API验证成功，找到匹配用户:', user.account)
			return user
		} else {
			console.log('API验证失败，未找到匹配用户')
			return null
		}
	} catch (error) {
		console.warn('API获取用户失败，尝试本地存储验证:', error)

		// API失败时，使用本地存储验证
		try {
			const storedUsers = uni.getStorageSync('users')
			if (storedUsers) {
				const users = JSON.parse(storedUsers)
				console.log('从本地存储获取到用户列表:', users.length, '个用户')

				// 查找匹配的用户
				const user = users.find(u => {
					const accountMatch = u.account === account || u.phone === account
					const passwordMatch = u.password === password
					return accountMatch && passwordMatch
				})

				if (user) {
					// console.log('本地验证成功，找到匹配用户:', user.account)
					return user
				} else {
					console.log('本地验证失败，未找到匹配用户')
					return null
				}
			} else {
				console.log('本地存储为空')
				return null
			}
		} catch (storageError) {
			console.error('本地存储验证失败:', storageError)
			return null
		}
	}
}

// 确保用户数据包含购物车信息
async function ensureUserCartData(user) {
	try {
		// 确保用户有购物车数据结构
		const completeUser = {
			...user,
			// 确保有购物车字段
			cart: user.cart || {
				Ticketing: [],
				Hotel: [],
				Souvenir: []
			}
		}

		// console.log('用户数据完整性检查完成')
		return completeUser
	} catch (error) {
		console.error('用户数据完整性检查失败:', error)
		// 即使失败也返回原用户数据
		return user
	}
}

// 处理注册
async function handleRegister() {
	if (!canRegister.value) {
		uni.showToast({
			title: '请填写完整信息',
			icon: 'none'
		})
		return
	}

	// 验证账号
	const accountValidation = validateAccount(registerForm.value.account)
	if (!accountValidation.valid) {
		uni.showToast({
			title: accountValidation.message,
			icon: 'none'
		})
		return
	}

	// 验证手机号
	if (!validatePhone(registerForm.value.phone)) {
		uni.showToast({
			title: '请输入正确的手机号',
			icon: 'none'
		})
		return
	}

	// 验证验证码
	if (!validateVerificationCode(registerForm.value.verificationCode)) {
		uni.showToast({
			title: '验证码错误或已过期',
			icon: 'none'
		})
		return
	}

	// 验证密码
	if (!validatePassword(registerForm.value.password)) {
		uni.showToast({
			title: '密码长度应为6-20位',
			icon: 'none'
		})
		return
	}

	// 验证确认密码
	if (registerForm.value.password !== registerForm.value.confirmPassword) {
		uni.showToast({
			title: '两次输入的密码不一致',
			icon: 'none'
		})
		return
	}

	try {
		console.log('开始注册流程，账号:', registerForm.value.account)

		// 使用本地验证避免API错误，参考managePage的验证逻辑
		const accountExists = await checkAccountExistsLocal(registerForm.value.account)
		if (accountExists) {
			uni.showToast({
				title: '该账号已存在，请更换账号',
				icon: 'none'
			})
			return
		}

		const phoneExists = await checkPhoneExistsLocal(registerForm.value.phone)
		if (phoneExists) {
			uni.showToast({
				title: '该手机号已注册',
				icon: 'none'
			})
			return
		}

		// 构建用户数据，参考managePage的数据结构
		const newUserData = {
			// 必填字段
			name: `OwO用户_${generateRandomNumber()}`,
			account: registerForm.value.account,
			phone: registerForm.value.phone,
			password: registerForm.value.password,

			// 可选字段，设置默认值
			img: '/static/images/DefaultAvatar.png',
			isAdmin: 0,
			clubDays: 0,
			points: 0,
			likes: 0,
			coupons: 0,
			footprints: 0
		}

		console.log('创建用户数据:', newUserData)

		// 直接使用userService.createUser方法，与managePage保持一致
		const result = await userService.createUser(newUserData)
		console.log('创建用户结果:', result)

		if (result.code === 200) {
			// 同时更新本地存储，确保数据同步
			await updateLocalStorage(newUserData)

			uni.showToast({
				title: '注册成功，请登录',
				icon: 'success'
			})

			// 保存注册的账号用于预填
			const registeredAccount = registerForm.value.account

			// 清空注册表单
			registerForm.value = {
				account: '',
				phone: '',
				verificationCode: '',
				password: '',
				confirmPassword: '',
				agreed: false
			}

			// 重置验证码状态
			resetCodeState()

			// 延迟切换到登录tab，并预填账号
			setTimeout(() => {
				// 切换到登录tab
				currentTab.value = 'login'

				// 预填刚注册的账号到登录表单
				loginForm.value = {
					account: registeredAccount,
					password: ''
				}

				uni.showToast({
					title: '请输入密码完成登录',
					icon: 'none'
				})
			}, 1500)
		} else {
			uni.showToast({
				title: result.message || '注册失败',
				icon: 'none'
			})
		}

	} catch (error) {
		console.error('注册失败:', error)

		// 提供友好的错误提示
		if (error.message.includes('缺少必填参数')) {
			uni.showToast({
				title: '请填写完整信息',
				icon: 'none'
			})
		} else if (error.message.includes('账号已存在')) {
			uni.showToast({
				title: '该账号已存在，请更换账号',
				icon: 'none'
			})
		} else if (error.message.includes('手机号已存在')) {
			uni.showToast({
				title: '该手机号已注册',
				icon: 'none'
			})
		} else if (error.message.includes('fetch') || error.message.includes('网络')) {
			uni.showToast({
				title: '网络连接失败，请检查网络',
				icon: 'none'
			})
		} else {
			uni.showToast({
				title: '注册失败，请重试',
				icon: 'none'
			})
		}
	}
}



// 本地检查账号是否存在（参考managePage的验证逻辑）
async function checkAccountExistsLocal(account) {
	try {
		// 首先尝试通过getAllUsers API检查
		const users = await userService.getAllUsers()
		return users.some(user => user.account === account)
	} catch (error) {
		console.warn('API检查失败，使用本地存储检查:', error)
		// API失败时检查本地存储
		try {
			const storedUsers = uni.getStorageSync('users')
			if (storedUsers) {
				const users = JSON.parse(storedUsers)
				return users.some(user => user.account === account)
			}
		} catch (storageError) {
			console.error('本地存储检查失败:', storageError)
		}
		return false
	}
}

// 本地检查手机号是否存在（参考managePage的验证逻辑）
async function checkPhoneExistsLocal(phone) {
	try {
		// 首先尝试通过getAllUsers API检查
		const users = await userService.getAllUsers()
		return users.some(user => user.phone === phone)
	} catch (error) {
		console.warn('API检查失败，使用本地存储检查:', error)
		// API失败时检查本地存储
		try {
			const storedUsers = uni.getStorageSync('users')
			if (storedUsers) {
				const users = JSON.parse(storedUsers)
				return users.some(user => user.phone === phone)
			}
		} catch (storageError) {
			console.error('本地存储检查失败:', storageError)
		}
		return false
	}
}

// 更新本地存储（确保与managePage的数据同步）
async function updateLocalStorage(newUserData) {
	try {
		console.log('更新本地存储，新用户:', newUserData)

		// 获取现有用户列表
		let users = []
		try {
			const storedUsers = uni.getStorageSync('users')
			if (storedUsers) {
				users = JSON.parse(storedUsers)
			}
		} catch (e) {
			console.warn('获取本地用户数据失败，创建新数组')
			users = []
		}

		// 添加新用户到列表（添加本地ID）
		const userWithId = {
			...newUserData,
			id: String(Date.now()) // 添加本地ID
		}

		users.push(userWithId)

		// 保存到本地存储
		uni.setStorageSync('users', JSON.stringify(users))
		console.log('本地存储更新成功，用户总数:', users.length)

		return true
	} catch (error) {
		console.error('更新本地存储失败:', error)
		return false
	}
}

// 忘记密码
function forgotPassword() {
	currentTab.value = 'forgot'
	// 清空忘记密码表单
	forgotPasswordForm.value = {
		account: '',
		phone: '',
		verificationCode: '',
		newPassword: '',
		confirmPassword: ''
	}
}

// 返回登录
function backToLogin() {
	currentTab.value = 'login'
	// 清空登录表单
	loginForm.value = {
		account: '',
		password: ''
	}
}

// 处理重置密码
async function handleResetPassword() {
	try {
		// 表单验证
		const validation = validateResetPasswordForm()
		if (!validation.isValid) {
			uni.showToast({
				title: validation.message,
				icon: 'none'
			})
			return
		}

		// 验证验证码
		if (forgotPasswordForm.value.verificationCode !== currentVerificationCode.value) {
			uni.showToast({
				title: '验证码错误',
				icon: 'none'
			})
			return
		}

		// 调用API重置密码
		const result = await userService.updateUserPasswordWithPhone(
			forgotPasswordForm.value.account,
			forgotPasswordForm.value.phone,
			forgotPasswordForm.value.newPassword
		)

		if (result.code === 200) {
			uni.showToast({
				title: '密码重置成功',
				icon: 'success'
			})

			// 延迟跳转到登录页面并预填账号
			setTimeout(() => {
				currentTab.value = 'login'
				loginForm.value = {
					account: forgotPasswordForm.value.account,
					password: ''
				}

				uni.showToast({
					title: '请使用新密码登录',
					icon: 'none'
				})
			}, 1500)
		}
	} catch (error) {
		console.error('重置密码失败:', error)
		uni.showToast({
			title: error.message || '重置密码失败',
			icon: 'none'
		})
	}
}

// 显示用户协议
function showUserAgreement() {
	uni.showModal({
		title: '用户协议',
		content: `欢迎使用OwOTicket服务！

1. 服务条款
通过注册和使用我们的服务，您同意遵守以下条款：
• 您必须年满18周岁或在法定监护人同意下使用本服务
• 您承诺提供真实、准确的个人信息
• 您不得利用本服务进行任何违法或不当行为

2. 账户责任
• 您有责任保护您的账户安全
• 您对使用您账户进行的所有活动负责
• 如发现账户异常，请立即联系客服

3. 服务使用
• 我们提供门票预订、住宿安排等旅游服务
• 服务内容可能会根据实际情况进行调整
• 我们保留暂停或终止服务的权利

4. 知识产权
• 本平台的所有内容均受知识产权法保护
• 未经授权，不得复制、传播平台内容

5. 免责声明
• 我们会尽力提供准确的信息，但不保证绝对无误
• 对于不可抗力因素造成的损失，我们不承担责任

6. 协议修改
我们保留随时修改本协议的权利，修改后的协议将在平台内公布。继续使用服务即表示您接受修改后的协议。

如有疑问，请联系客服：400-888-0000`,
		showCancel: false,
		confirmText: '我已阅读'
	})
}

// 显示隐私政策
function showPrivacyPolicy() {
	uni.showModal({
		title: '隐私政策',
		content: `OwOTicket隐私政策

我们非常重视您的隐私保护，本政策说明我们如何收集、使用和保护您的个人信息。

1. 信息收集
我们可能收集以下信息：
• 注册信息：姓名、手机号、邮箱等
• 使用信息：浏览记录、订单信息等
• 设备信息：设备型号、操作系统等
• 位置信息：用于提供本地化服务（需您授权）

2. 信息使用
我们使用您的信息用于：
• 提供和改善我们的服务
• 处理您的订单和支付
• 发送重要通知和服务更新
• 客户服务和技术支持
• 防范欺诈和安全威胁

3. 信息保护
• 我们采用行业标准的安全措施保护您的信息
• 使用加密技术传输敏感数据
• 限制员工访问个人信息的权限
• 定期进行安全审计和更新

4. 信息共享
我们不会出售您的个人信息。仅在以下情况下可能共享：
• 获得您的明确同意
• 法律法规要求
• 保护我们的合法权益
• 与可信的第三方服务提供商合作（如支付处理）

5. 您的权利
您有权：
• 访问和更新您的个人信息
• 删除您的账户和相关数据
• 撤回对某些信息处理的同意
• 投诉数据处理行为

6. Cookie使用
我们使用Cookie和类似技术来：
• 记住您的偏好设置
• 分析网站使用情况
• 提供个性化内容

7. 政策更新
我们可能会更新本隐私政策，更新后会在应用内通知您。

联系我们：
如对隐私政策有疑问，请联系：
邮箱：privacy@owoticket.com
电话：400-888-0000`,
		showCancel: false,
		confirmText: '我已阅读'
	})
}
</script>

<style scoped>
page {
	background-color: #f5f5f5;
}

.container {
	min-height: 94vh;
	background: linear-gradient(to bottom, #36cfc9 0%, #36cfc9 40%, #f5f5f5 50%, #f5f5f5 100%);
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 20rpx 30rpx;
	box-sizing: border-box;
}

.login-container {
	width: 100%;
	max-width: 600rpx;
}

/* Logo区域 */
.logo-section {
	text-align: center;
	margin-bottom: 40rpx;
	transition: all 0.3s ease;
}

.logo {
	width: 120rpx;
	height: 120rpx;
	margin-bottom: 30rpx;
}

.app-name {
	display: block;
	font-size: 48rpx;
	font-weight: 700;
	color: #ffffff;
	margin-bottom: 15rpx;
}

.app-subtitle {
	display: block;
	font-size: 28rpx;
	color: rgba(255, 255, 255, 0.8);
	font-weight: 500;
}

/* 表单区域 */
.form-section {
	background-color: #ffffff;
	border-radius: 20rpx;
	padding: 0;
	box-shadow: 0 8rpx 30rpx rgba(0, 0, 0, 0.1);
	overflow: hidden;
}

/* Tab切换 */
.tab-container {
	display: flex;
	position: relative;
	background-color: #f8f9fa;
}

.tab-item {
	flex: 1;
	text-align: center;
	padding: 30rpx 0;
	position: relative;
	cursor: pointer;
}

.tab-text {
	font-size: 32rpx;
	color: #666;
	font-weight: 500;
	transition: color 0.3s ease;
}

.tab-item.active .tab-text {
	color: #36cfc9;
	font-weight: 600;
}

.tab-indicator {
	position: absolute;
	bottom: 0;
	width: 50%;
	height: 6rpx;
	background-color: #36cfc9;
	border-radius: 3rpx;
	transition: left 0.3s ease;
	transform: translateX(-50%);
}

/* 表单内容 */
.form-content {
	padding: 30rpx;
}

.input-group {
	margin-bottom: 30rpx;
}

.input-item {
	position: relative;
	margin-bottom: 25rpx;
}

.input-label {
	display: block;
	font-size: 28rpx;
	color: #333;
	font-weight: 600;
	margin-bottom: 15rpx;
}

.input-field {
	height: 88rpx;
	border: 2rpx solid #e0e0e0;
	border-radius: 12rpx;
	padding: 0 20rpx;
	font-size: 28rpx;
	color: #333;
	background-color: #fff;
	transition: border-color 0.3s ease;
}

.input-field:focus {
	border-color: #36cfc9;
	outline: none;
}

.input-field::placeholder {
	color: #999;
}

.password-toggle {
	position: absolute;
	right: 20rpx;
	top: 68%;
	transform: translateY(-50%);
	font-size: 26rpx;
	color: #36cfc9;
	cursor: pointer;
}

/* 手机号输入容器 */
.phone-input-container {
	display: flex;
	gap: 20rpx;
	align-items: center;
}

.phone-input {
	flex: 1;
}

.verify-btn {
	width: 200rpx;
	height: 88rpx;
	background-color: #36cfc9;
	color: #ffffff;
	border: none;
	border-radius: 12rpx;
	font-size: 26rpx;
	font-weight: 500;
	transition: all 0.3s ease;
}

.verify-btn:active:not(:disabled) {
	background-color: #2bb8bb;
	transform: scale(0.98);
}

.verify-btn:disabled {
	background-color: #ccc;
	color: #999;
	cursor: not-allowed;
}

.verify-btn::after {
	border: none;
}

/* 协议部分 */
.agreement-section {
	margin-bottom: 30rpx;
}


.agreement-text {
	font-size: 13px;
	color: #666;
	line-height: 1.5;
}

.agreement-link {
	font-size: 13px;
	color: #36cfc9;
	line-height: 1.5;
	text-decoration: underline;
	cursor: pointer;
	transition: color 0.3s ease;
}

.agreement-link:active {
	color: #2bb8bb;
}

/* 提交按钮 */
.submit-btn {
	width: 100%;
	height: 88rpx;
	background-color: #36cfc9;
	color: #fff;
	border: none;
	border-radius: 12rpx;
	font-size: 32rpx;
	font-weight: 600;
	margin-bottom: 20rpx;
	transition: background-color 0.3s ease;
}

.submit-btn:active:not(:disabled) {
	background-color: #2bb8bb;
}

.submit-btn:disabled {
	background-color: #ccc;
	color: #999;
}

/* 表单底部 */
.form-footer {
	text-align: center;
}

.forgot-password {
	font-size: 26rpx;
	color: #36cfc9;
	cursor: pointer;
}

/* 忘记密码标题 */
.forgot-title {
	text-align: center;
	padding: 40rpx 0;
}

.title-text {
	display: block;
	font-size: 48rpx;
	font-weight: 700;
	color: #333;
	margin-bottom: 20rpx;
}

.subtitle-text {
	font-size: 28rpx;
	color: #666;
	line-height: 1.5;
}

/* 返回登录 */
.back-to-login {
	font-size: 26rpx;
	color: #36cfc9;
	cursor: pointer;
	text-align: center;
}

/* 响应式设计 */
@media screen and (max-width: 750rpx) {
	.container {
		padding: 20rpx 20rpx;
	}

	.logo {
		width: 100rpx;
		height: 100rpx;
	}

	.app-name {
		font-size: 42rpx;
	}

	.form-content {
		padding: 30rpx 20rpx;
	}
}

/* 动画效果 */
.form-section {
	animation: slideUp 0.5s ease-out;
}

@keyframes slideUp {
	from {
		opacity: 0;
		transform: translateY(50rpx);
	}

	to {
		opacity: 1;
		transform: translateY(0);
	}
}

.logo {
	animation: fadeIn 0.8s ease-out;
}

@keyframes fadeIn {
	from {
		opacity: 0;
		transform: scale(0.8);
	}

	to {
		opacity: 1;
		transform: scale(1);
	}
}

/* 验证码弹窗样式 */
.modal-overlay {
	position: fixed;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background-color: rgba(0, 0, 0, 0.5);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 9999;
}

.code-modal {
	width: 600rpx;
	background-color: #ffffff;
	border-radius: 20rpx;
	overflow: hidden;
	animation: modalSlideUp 0.3s ease-out;
}

@keyframes modalSlideUp {
	from {
		opacity: 0;
		transform: translateY(100rpx);
	}

	to {
		opacity: 1;
		transform: translateY(0);
	}
}

.modal-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 40rpx 30rpx 20rpx;
	border-bottom: 1rpx solid #f0f0f0;
}

.modal-title {
	font-size: 32rpx;
	font-weight: 600;
	color: #333;
}

.modal-close {
	font-size: 40rpx;
	color: #999;
	cursor: pointer;
	width: 60rpx;
	height: 60rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.modal-content {
	padding: 40rpx 30rpx;
	text-align: center;
}

.modal-text {
	display: block;
	font-size: 28rpx;
	color: #666;
	margin-bottom: 10rpx;
}

.modal-phone {
	display: block;
	font-size: 32rpx;
	font-weight: 600;
	color: #36cfc9;
	margin: 20rpx 0;
}

.code-display {
	background-color: #f8f9fa;
	border-radius: 12rpx;
	padding: 30rpx;
	margin: 30rpx 0;
	border: 2rpx dashed #36cfc9;
}

.code-label {
	display: block;
	font-size: 24rpx;
	color: #666;
	margin-bottom: 10rpx;
}

.code-value {
	display: block;
	font-size: 48rpx;
	font-weight: 700;
	color: #36cfc9;
	letter-spacing: 8rpx;
	font-family: 'Courier New', monospace;
}

.modal-tips {
	margin-top: 30rpx;
	text-align: left;
}

.tip-text {
	display: block;
	font-size: 24rpx;
	color: #999;
	margin-bottom: 8rpx;
}

.modal-footer {
	padding: 20rpx 30rpx 40rpx;
}

.modal-btn {
	width: 100%;
	height: 88rpx;
	border: none;
	border-radius: 12rpx;
	font-size: 32rpx;
	font-weight: 600;
	transition: all 0.3s ease;
}

.confirm-btn {
	background-color: #36cfc9;
	color: #ffffff;
}

.confirm-btn:active {
	background-color: #2bb8bb;
	transform: scale(0.98);
}

.modal-btn::after {
	border: none;
}
</style>