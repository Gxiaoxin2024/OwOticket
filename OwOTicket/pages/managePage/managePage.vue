<template>
	<view class="container">
		<!-- 顶部标题栏 -->
		<view class="header">
			<text class="title">用户管理</text>
			<button class="add-btn" @click="showAddUserModal">添加用户</button>
		</view>

		<!-- 统计信息 -->
		<view class="stats-section">
			<view class="stat-item">
				<text class="stat-number">{{ userList.length }}</text>
				<text class="stat-label">总用户数</text>
			</view>
			<view class="stat-item">
				<text class="stat-number">{{ adminCount }}</text>
				<text class="stat-label">管理员数</text>
			</view>
			<view class="stat-item">
				<text class="stat-number">{{ activeCount }}</text>
				<text class="stat-label">活跃用户</text>
			</view>
		</view>

		<!-- 用户列表 -->
		<view class="user-list">
			<view class="user-item" v-for="(user, index) in userList" :key="user.id">
				<view class="user-info">
					<image :src="user.img || '/static/images/DefaultAvatar.png'" class="user-avatar" mode="aspectFill"></image>
					<view class="user-details">
						<view class="user-name-row">
							<text class="user-name">{{ user.name }}</text>
							<text class="admin-badge" v-if="user.isAdmin === 1 || user.isAdmin === true">管理员</text>
						</view>
						<text class="user-info-line">账号：{{ user.account }}</text>
						<text class="user-info-line">手机号：{{ user.phone }}</text>
						<text class="user-info-line">已注册：{{ user.clubDays }}天</text>
					</view>
				</view>
				<view class="user-actions">
					<button class="edit-btn" @click="editUser(user, index)">编辑</button>
					<button class="delete-btn" @click="deleteUser(user, index)"
						:disabled="user.isAdmin === 1 || user.isAdmin === true">
						删除
					</button>
				</view>
			</view>
		</view>

		<!-- 空状态 -->
		<view class="empty-state" v-if="userList.length === 0">
			<text class="empty-text">暂无用户数据</text>
			<button class="empty-btn" @click="showAddUserModal">添加第一个用户</button>
		</view>

		<!-- 添加/编辑用户弹窗 -->
		<view class="modal-overlay" v-if="showModal" @click="closeModal">
			<view class="modal" @click.stop>
				<view class="modal-header">
					<text class="modal-title">{{ isEdit ? '编辑用户' : '添加用户' }}</text>
					<text class="modal-close" @click="closeModal">×</text>
				</view>
				<view class="modal-content">
					<view class="form-group">
						<text class="form-label">用户名</text>
						<input class="form-input" v-model="formData.name" placeholder="请输入用户名" />
					</view>
					<view class="form-group">
						<text class="form-label">头像</text>
						<view class="avatar-section">
							<view class="avatar-preview" @click="chooseUserAvatar">
								<image :src="formData.img || '/static/images/DefaultAvatar.png'" class="avatar-image" mode="aspectFill">
								</image>
								<view class="avatar-overlay">
									<text class="avatar-text">点击更换</text>
								</view>
							</view>
							<view class="avatar-info">
								<text class="avatar-tip">点击头像可更换图片</text>
								<text class="avatar-size">建议尺寸：200x200像素</text>
							</view>
						</view>
					</view>
					<view class="form-group">
						<text class="form-label">账号</text>
						<input class="form-input" v-model="formData.account" placeholder="请输入账号" :disabled="isEdit" />
						<text class="form-hint" v-if="isEdit">编辑时不可修改账号</text>
					</view>
					<view class="form-group">
						<text class="form-label">手机号</text>
						<input class="form-input" v-model="formData.phone" placeholder="请输入手机号" />
					</view>
					<view class="form-group">
						<text class="form-label">密码</text>
						<input class="form-input" v-model="formData.password" placeholder="请输入密码" />
					</view>
					<view class="form-group">
						<text class="form-label">积分</text>
						<input class="form-input" type="number" v-model="formData.points" placeholder="请输入积分" />
					</view>
					<view class="form-group">
						<text class="form-label">俱乐部天数</text>
						<input class="form-input" type="number" v-model="formData.clubDays" placeholder="请输入俱乐部天数" />
					</view>
					<view class="form-group">
						<text class="form-label">点赞数</text>
						<input class="form-input" type="number" v-model="formData.likes" placeholder="请输入点赞数" />
					</view>
					<view class="form-group">
						<text class="form-label">优惠券数</text>
						<input class="form-input" type="number" v-model="formData.coupons" placeholder="请输入优惠券数" />
					</view>
					<view class="form-group">
						<text class="form-label">足迹数</text>
						<input class="form-input" type="number" v-model="formData.footprints" placeholder="请输入足迹数" />
					</view>
					<view class="form-group">
						<text class="form-label">管理员权限</text>
						<radio-group @change="onAdminChange" class="radio-group"
							:class="{ 'disabled': isEdit && formData.account === 'admin' }">
							<label class="radio-item">
								<radio value="0" :checked="formData.isAdmin === 0" :disabled="isEdit && formData.account === 'admin'" />
								<text class="radio-text">普通用户</text>
							</label>
							<label class="radio-item">
								<radio value="1" :checked="formData.isAdmin === 1" :disabled="isEdit && formData.account === 'admin'" />
								<text class="radio-text">管理员</text>
							</label>
						</radio-group>
						<text class="form-hint" v-if="isEdit && formData.account === 'admin'">
							超级管理员权限不可修改
						</text>
					</view>
				</view>
				<view class="modal-footer">
					<button class="cancel-btn" @click="closeModal">取消</button>
					<button class="confirm-btn" @click="saveUser">{{ isEdit ? '保存' : '添加' }}</button>
				</view>
			</view>
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
import userService from '../../utils/userUtils.js'
import { deleteUserCartData } from '../../utils/cartUtils.js'
import orderService from '../../utils/orderUtils.js'
import ImageUtils from '../../utils/imageUtils.js'

// 响应式数据
const userList = ref([])
const showModal = ref(false)
const isEdit = ref(false)
const editIndex = ref(-1)

// 表单数据
const formData = ref({
	name: '',
	account: '',
	phone: '',
	password: '',
	points: 0,
	clubDays: 0,
	likes: 0,
	coupons: 0,
	footprints: 0,
	img: '/static/images/DefaultAvatar.png',
	isAdmin: 0
})

// 计算属性
const adminCount = computed(() => {
	return userList.value.filter(user => user.isAdmin === 1 || user.isAdmin === true).length
})

const activeCount = computed(() => {
	return userList.value.filter(user => user.points > 0 || user.clubDays > 0).length
})

// 页面加载时获取用户数据
onMounted(() => {
	checkAdminPermission()
	loadUserData()
})

// 页面显示时刷新数据
onShow(() => {
	checkAdminPermission()
	loadUserData()
})

// 检查管理员权限
function checkAdminPermission() {
	try {
		const currentUserStr = uni.getStorageSync('currentUser')
		if (!currentUserStr) {
			redirectToLogin()
			return
		}
		// const currentUser = JSON.parse(currentUserStr)
		// // 根据isAdmin字段判断管理员权限（1为管理员，0不是管理员）
		// const isAdmin = currentUser.isAdmin === 1 || currentUser.isAdmin === true

		// if (!isAdmin) {
		// 	uni.showToast({
		// 		title: '无权限访问',
		// 		icon: 'none'
		// 	})
		// 	setTimeout(() => {
		// 		uni.navigateBack()
		// 	}, 1500)
		// 	return
		// }
	} catch (error) {
		console.error('权限检查失败:', error)
		redirectToLogin()
	}
}

// 跳转到登录页面
function redirectToLogin() {
	uni.showToast({
		title: '请先登录',
		icon: 'none'
	})
	setTimeout(() => {
		uni.reLaunch({
			url: '/pages/LoginPage/LoginPage'
		})
	}, 1500)
}

// 加载用户数据
async function loadUserData() {
	try {

		// 首先尝试从API获取用户数据
		const users = await userService.getAllUsers()
		// console.log('从API获取到用户数据:', users.length, '个用户')

		userList.value = users

		// 同步更新本地存储
		uni.setStorageSync('users', JSON.stringify(users))

	} catch (error) {
		console.error('从API加载用户数据失败，尝试本地存储:', error)

		// API失败时，从本地存储获取数据
		try {
			const storedUsers = uni.getStorageSync('users')
			if (storedUsers) {
				userList.value = JSON.parse(storedUsers)
				console.log('从本地存储加载用户数据:', userList.value.length, '个用户')
			} else {
				userList.value = []
				console.log('本地存储也没有用户数据')
			}
		} catch (localError) {
			console.error('从本地存储加载数据也失败:', localError)
			userList.value = []
			uni.showToast({
				title: '加载数据失败',
				icon: 'none'
			})
		}
	}
}

// 保存用户数据到本地存储
function saveUserData() {
	try {
		uni.setStorageSync('users', JSON.stringify(userList.value))
		return true
	} catch (error) {
		console.error('保存用户数据失败:', error)
		uni.showToast({
			title: '保存数据失败',
			icon: 'none'
		})
		return false
	}
}

// 显示添加用户弹窗
function showAddUserModal() {
	isEdit.value = false
	editIndex.value = -1
	resetFormData()
	showModal.value = true
}

// 编辑用户
function editUser(user, index) {
	isEdit.value = true
	editIndex.value = index

	// 确保复制所有用户数据，包括必要的字段
	formData.value = {
		...user,
		// 确保数字字段正确转换
		points: Number(user.points) || 0,
		clubDays: Number(user.clubDays) || 0,
		likes: Number(user.likes) || 0,
		coupons: Number(user.coupons) || 0,
		footprints: Number(user.footprints) || 0,
		isAdmin: user.isAdmin === true ? 1 : (user.isAdmin === 1 ? 1 : 0)
	}

	// console.log('编辑用户数据:', formData.value)
	showModal.value = true
}

// 删除用户
async function deleteUser(user, index) {
	// 检查是否为管理员
	if (user.isAdmin === 1 || user.isAdmin === true) {
		uni.showToast({
			title: '管理员账号不可删除',
			icon: 'none'
		})
		return
	}

	uni.showModal({
		title: '确认删除',
		content: `确定要删除用户"${user.name}"吗？删除后该用户的购物车数据和订单数据也将被清空。`,
		success: async (res) => {
			if (res.confirm) {
				try {
					console.log('删除用户:', user.account)

					// 显示删除进度
					uni.showLoading({
						title: '删除中...'
					})

					// 1. 先删除用户的购物车数据
					console.log('清理用户购物车数据:', user.account)
					const cartClearResult = await deleteUserCartData(user.account)
					if (cartClearResult) {
						console.log('用户购物车数据清理成功')
					} else {
						console.warn('用户购物车数据清理失败，但继续删除用户')
					}

					// 2. 删除用户的所有订单数据
					console.log('清理用户订单数据:', user.account)
					try {
						const orderClearResult = await orderService.deleteUserAllOrders(user.account)
						if (orderClearResult.code === 200) {
							console.log('用户订单数据清理成功:', orderClearResult.message)
							console.log('删除订单数:', orderClearResult.data.deletedOrdersCount)
							console.log('删除订单项数:', orderClearResult.data.deletedItemsCount)
						} else {
							console.warn('用户订单数据清理失败，但继续删除用户')
						}
					} catch (error) {
						console.warn('用户订单数据清理失败:', error.message, '但继续删除用户')
					}

					// 3. 调用API删除用户
					await userService.deleteUser(user.account)

					// 4. 从列表中移除用户
					userList.value.splice(index, 1)

					// 5. 同步更新本地存储
					saveUserData()

					// 6. 检查是否删除的是当前登录用户
					await checkAndUpdateCurrentUser(user)

					uni.hideLoading()
					uni.showToast({
						title: '删除成功',
						icon: 'success'
					})

				} catch (error) {
					uni.hideLoading()
					console.error('删除用户失败:', error)
					uni.showToast({
						title: '删除失败: ' + error.message,
						icon: 'none'
					})
				}
			}
		}
	})
}

// 保存用户
async function saveUser() {
	// 验证表单数据
	if (!(await validateForm())) {
		return
	}

	try {
		if (isEdit.value) {
			// 编辑用户
			// console.log('更新用户数据:', formData.value)
			// console.log('账号字段:', formData.value.account)

			// 确保必要字段存在
			if (!formData.value.account) {
				throw new Error('账号字段缺失')
			}

			// 调用API更新用户 - 只传递一个userData参数
			await userService.updateUser(formData.value)

			// 更新本地列表
			userList.value[editIndex.value] = { ...formData.value }

			// 检查是否更新的是当前登录用户
			await checkAndUpdateCurrentUser(formData.value)

			uni.showToast({
				title: '编辑成功',
				icon: 'success'
			})
		} else {
			// 添加用户
			console.log('创建新用户:', formData.value.account)

			// 构建新用户数据，确保包含所有必填字段和有效的可选字段
			const newUserData = {
				// 必填字段
				name: formData.value.name,
				account: formData.value.account,
				phone: formData.value.phone,
				password: formData.value.password,

				// 可选字段 - 只有当有值时才包含
				...(formData.value.clubDays !== undefined && formData.value.clubDays !== null && { clubDays: formData.value.clubDays }),
				...(formData.value.points !== undefined && formData.value.points !== null && { points: formData.value.points }),
				...(formData.value.likes !== undefined && formData.value.likes !== null && { likes: formData.value.likes }),
				...(formData.value.coupons !== undefined && formData.value.coupons !== null && { coupons: formData.value.coupons }),
				...(formData.value.footprints !== undefined && formData.value.footprints !== null && { footprints: formData.value.footprints }),
				...(formData.value.isAdmin !== undefined && formData.value.isAdmin !== null && { isAdmin: formData.value.isAdmin }),
				...(formData.value.img && formData.value.img.trim() && { img: formData.value.img }),

				// 本地使用的ID字段
				id: String(Date.now())
			}

			console.log('发送到API的用户数据:', newUserData)

			// 调用API创建用户
			const result = await userService.createUser(newUserData)
			console.log('API创建用户结果:', result)

			// 添加到本地列表
			userList.value.push(newUserData)

			uni.showToast({
				title: '添加成功',
				icon: 'success'
			})
		}

		// 同步更新本地存储
		saveUserData()
		closeModal()

	} catch (error) {
		console.error('保存用户失败:', error)
		uni.showToast({
			title: '保存失败: ' + error.message,
			icon: 'none'
		})
	}
}

// 验证表单数据
async function validateForm() {
	// 验证必填字段
	if (!formData.value.name || !formData.value.name.trim()) {
		uni.showToast({
			title: '请输入用户名',
			icon: 'none'
		})
		return false
	}

	if (!formData.value.account || !formData.value.account.trim()) {
		uni.showToast({
			title: '请输入账号',
			icon: 'none'
		})
		return false
	}

	if (!formData.value.phone || !formData.value.phone.trim()) {
		uni.showToast({
			title: '请输入手机号',
			icon: 'none'
		})
		return false
	}

	if (!formData.value.password || !formData.value.password.trim()) {
		uni.showToast({
			title: '请输入密码',
			icon: 'none'
		})
		return false
	}

	// 验证字段长度
	if (formData.value.name.trim().length < 2) {
		uni.showToast({
			title: '用户名至少2个字符',
			icon: 'none'
		})
		return false
	}

	if (formData.value.account.trim().length < 3) {
		uni.showToast({
			title: '账号至少3个字符',
			icon: 'none'
		})
		return false
	}

	if (formData.value.password.trim().length < 6) {
		uni.showToast({
			title: '密码至少6个字符',
			icon: 'none'
		})
		return false
	}

	// 验证手机号格式
	const phoneRegex = /^1[3-9]\d{9}$/
	if (!phoneRegex.test(formData.value.phone.trim())) {
		uni.showToast({
			title: '请输入正确的手机号',
			icon: 'none'
		})
		return false
	}

	// 验证可选数字字段的有效性
	const numericFields = ['clubDays', 'points', 'likes', 'coupons', 'footprints']
	for (const field of numericFields) {
		if (formData.value[field] !== undefined && formData.value[field] !== null && formData.value[field] !== '') {
			const value = Number(formData.value[field])
			if (isNaN(value) || value < 0) {
				uni.showToast({
					title: `${getFieldLabel(field)}必须是非负数`,
					icon: 'none'
				})
				return false
			}
		}
	}

	try {
		// 检查账号是否重复（编辑时排除自己）
		if (!isEdit.value || (isEdit.value && userList.value[editIndex.value].account !== formData.value.account)) {
			const accountExists = await userService.checkAccountExists(formData.value.account)
			if (accountExists) {
				uni.showToast({
					title: '账号已存在',
					icon: 'none'
				})
				return false
			}
		}

		// 检查手机号是否重复（编辑时排除自己）
		if (!isEdit.value || (isEdit.value && userList.value[editIndex.value].phone !== formData.value.phone)) {
			const phoneExists = await userService.checkPhoneExists(formData.value.phone)
			if (phoneExists) {
				uni.showToast({
					title: '手机号已存在',
					icon: 'none'
				})
				return false
			}
		}

		return true

	} catch (error) {
		console.error('验证失败:', error)
		// 如果API验证失败，使用本地验证作为备用
		return validateFormLocal()
	}
}

// 本地验证备用方案
function validateFormLocal() {
	// 检查账号是否重复（编辑时排除自己）
	const existingUser = userList.value.find((user, index) => {
		return user.account === formData.value.account &&
			(isEdit.value ? index !== editIndex.value : true)
	})

	if (existingUser) {
		uni.showToast({
			title: '账号已存在',
			icon: 'none'
		})
		return false
	}

	// 检查手机号是否重复（编辑时排除自己）
	const existingPhone = userList.value.find((user, index) => {
		return user.phone === formData.value.phone &&
			(isEdit.value ? index !== editIndex.value : true)
	})

	if (existingPhone) {
		uni.showToast({
			title: '手机号已存在',
			icon: 'none'
		})
		return false
	}

	return true
}

// 关闭弹窗
function closeModal() {
	showModal.value = false
	resetFormData()
}

// 处理管理员权限变更
function onAdminChange(e) {
	// 如果是编辑admin账号，禁止修改权限
	if (isEdit.value && formData.value.account === 'admin') {
		console.log('admin账号权限不可修改')
		return
	}

	formData.value.isAdmin = parseInt(e.detail.value)
	console.log('管理员权限变更为:', formData.value.isAdmin)
}

// 重置表单数据
function resetFormData() {
	formData.value = {
		name: '',
		account: '',
		phone: '',
		password: '',
		points: 0,
		clubDays: 0,
		likes: 0,
		coupons: 0,
		footprints: 0,
		img: '/static/images/DefaultAvatar.png',
		isAdmin: 0
	}
}

// 选择用户头像
async function chooseUserAvatar() {
	try {
		const base64Data = await ImageUtils.chooseImageAndConvertToBase64({
			loadingTitle: '处理头像中...',
			quality: 0.8,
			maxSizeMB: 10
		})

		// 更新头像数据
		formData.value.img = base64Data

	} catch (error) {
		console.error('用户头像选择失败:', error)
		// ImageUtils已经处理了错误提示，这里不需要额外处理
	}
}


// 获取字段标签
function getFieldLabel(field) {
	const labels = {
		clubDays: '会员天数',
		points: '积分',
		likes: '点赞数',
		coupons: '优惠券数',
		footprints: '足迹数'
	}
	return labels[field] || field
}

// 检查并更新当前用户数据
async function checkAndUpdateCurrentUser(userData) {
	try {
		const currentUserStr = uni.getStorageSync('currentUser')
		if (!currentUserStr) return

		const currentUser = JSON.parse(currentUserStr)

		// 如果修改的是当前登录用户，同步更新本地存储
		if (currentUser.account === userData.account || currentUser.id === userData.id) {

			// 合并更新数据，保持原有的登录状态
			const updatedUser = {
				...currentUser,
				...userData
			}

			uni.setStorageSync('currentUser', JSON.stringify(updatedUser))

			// 如果用户被删除，需要退出登录
			if (!userData.id) {
				uni.showModal({
					title: '账号已被删除',
					content: '您的账号已被管理员删除，将自动退出登录',
					showCancel: false,
					success: () => {
						// 清除登录信息
						uni.removeStorageSync('token')
						uni.removeStorageSync('currentUser')

						// 跳转到登录页
						uni.reLaunch({
							url: '/pages/LoginPage/LoginPage'
						})
					}
				})
			}
		}
	} catch (error) {
		console.error('更新当前用户数据失败:', error)
	}
}
</script>

<style scoped>
page {
	background-color: #f5f5f5;
}

.container {
	background-color: #f5f5f5;
	padding: 20rpx;
}

/* 顶部标题栏 */
.header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 30rpx;
	background-color: #ffffff;
	border-radius: 20rpx;
	margin-bottom: 30rpx;
	box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
}

.title {
	font-size: 36rpx;
	font-weight: 600;
	color: #333;
}

.add-btn {
	background-color: #36cfc9;
	color: #ffffff;
	border: none;
	border-radius: 12rpx;
	padding: 20rpx 30rpx;
	font-size: 28rpx;
	font-weight: 500;
	margin-right: 20rpx;
}

.add-btn::after {
	border: none;
}

/* 统计信息 */
.stats-section {
	display: flex;
	justify-content: space-around;
	padding: 30rpx;
	background-color: #ffffff;
	border-radius: 20rpx;
	margin-bottom: 30rpx;
	box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
}

.stat-item {
	display: flex;
	flex-direction: column;
	align-items: center;
}

.stat-number {
	font-size: 48rpx;
	font-weight: 700;
	color: #36cfc9;
	margin-bottom: 10rpx;
}

.stat-label {
	font-size: 24rpx;
	color: #666;
	font-weight: 500;
}

/* 用户列表 */
.user-list {
	background-color: #ffffff;
	border-radius: 20rpx;
	overflow: hidden;
	box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
}

.user-item {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 30rpx;
	border-bottom: 1rpx solid #f0f0f0;
}

.user-item:last-child {
	border-bottom: none;
}

.user-info {
	display: flex;
	align-items: center;
	flex: 1;
}

.user-avatar {
	width: 100rpx;
	height: 100rpx;
	border-radius: 50rpx;
	margin-right: 30rpx;
	border: 2rpx solid #f0f0f0;
}

.user-details {
	flex: 1;
}

.user-name-row {
	display: flex;
	align-items: center;
	margin-bottom: 10rpx;
	flex-wrap: nowrap;
}

.user-name {
	font-size: 32rpx;
	font-weight: 600;
	color: #333;
	margin-right: 20rpx;
	white-space: nowrap;
	flex-shrink: 0;
}

.admin-badge {
	background-color: #36cfc9;
	color: #ffffff;
	font-size: 20rpx;
	padding: 4rpx 12rpx;
	border-radius: 12rpx;
	font-weight: 500;
	white-space: nowrap;
	flex-shrink: 0;
}

.user-info-line {
	font-size: 24rpx;
	color: #666;
	margin-bottom: 8rpx;
	line-height: 1.4;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.user-actions {
	display: flex;
	gap: 20rpx;
}

.edit-btn,
.delete-btn {
	border: none;
	border-radius: 8rpx;
	font-size: 24rpx;
	font-weight: 500;
	display: flex;
	align-items: center;
	justify-content: center;
}

.edit-btn {
	background-color: #36cfc9;
	color: #ffffff;
}

.delete-btn {
	background-color: #ff4757;
	color: #ffffff;
}

.delete-btn:disabled {
	background-color: #ccc;
	color: #999;
}

.edit-btn::after,
.delete-btn::after {
	border: none;
}

/* 空状态 */
.empty-state {
	text-align: center;
	padding: 100rpx 30rpx;
	background-color: #ffffff;
	border-radius: 20rpx;
	box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
}

.empty-text {
	font-size: 28rpx;
	color: #999;
	margin-bottom: 40rpx;
}

.empty-btn {
	background-color: #36cfc9;
	color: #ffffff;
	border: none;
	border-radius: 12rpx;
	padding: 20rpx 40rpx;
	font-size: 28rpx;
	font-weight: 500;
}

.empty-btn::after {
	border: none;
}

/* 弹窗样式 */
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

.modal {
	width: 90%;
	max-width: 600rpx;
	max-height: 80vh;
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
	padding: 30rpx;
	max-height: 60vh;
	overflow-y: auto;
}

.form-group {
	margin-bottom: 30rpx;
}

.form-label {
	display: block;
	font-size: 28rpx;
	color: #333;
	font-weight: 600;
	margin-bottom: 15rpx;
}

.form-input {
	height: 80rpx;
	border: 2rpx solid #e0e0e0;
	border-radius: 12rpx;
	padding: 0 20rpx;
	font-size: 28rpx;
	color: #333;
	background-color: #fff;
	transition: border-color 0.3s ease;
}

.form-input:focus {
	border-color: #36cfc9;
	outline: none;
}

.form-input:disabled {
	background-color: #f5f5f5;
	color: #999;
}

.form-hint {
	font-size: 24rpx;
	color: #999;
	margin-top: 8rpx;
}

/* 头像选择样式 */
.avatar-section {
	display: flex;
	align-items: center;
	gap: 30rpx;
}

.avatar-preview {
	position: relative;
	width: 120rpx;
	height: 120rpx;
	border-radius: 60rpx;
	overflow: hidden;
	cursor: pointer;
	border: 3rpx solid #e0e0e0;
	transition: all 0.3s ease;
}

.avatar-preview:hover {
	border-color: #36cfc9;
	transform: scale(1.05);
}

.avatar-image {
	width: 100%;
	height: 100%;
	object-fit: cover;
}

.avatar-overlay {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background-color: rgba(0, 0, 0, 0.5);
	display: flex;
	align-items: center;
	justify-content: center;
	opacity: 0;
	transition: opacity 0.3s ease;
}

.avatar-preview:hover .avatar-overlay {
	opacity: 1;
}

.avatar-text {
	color: white;
	font-size: 22rpx;
	text-align: center;
}

.avatar-info {
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 8rpx;
}

.avatar-tip {
	font-size: 26rpx;
	color: #666;
}

.avatar-size {
	font-size: 22rpx;
	color: #999;
}

.modal-footer {
	display: flex;
	gap: 20rpx;
	padding: 20rpx 30rpx 40rpx;
	border-top: 1rpx solid #f0f0f0;
}

.cancel-btn,
.confirm-btn {
	flex: 1;
	height: 80rpx;
	border: none;
	border-radius: 12rpx;
	font-size: 28rpx;
	font-weight: 600;
	transition: all 0.3s ease;
}

.cancel-btn {
	background-color: #f5f5f5;
	color: #666;
}

.confirm-btn {
	background-color: #36cfc9;
	color: #ffffff;
}

.cancel-btn:active {
	background-color: #e0e0e0;
}

.confirm-btn:active {
	background-color: #2bb8bb;
}

.cancel-btn::after,
.confirm-btn::after {
	border: none;
}

/* 单选框组样式 */
.radio-group {
	display: flex;
	gap: 40rpx;
	margin-top: 15rpx;
	padding: 20rpx;
	background-color: #f8f9fa;
	border-radius: 12rpx;
	border: 1rpx solid #e0e0e0;
}

.radio-item {
	display: flex;
	align-items: center;
	cursor: pointer;
	padding: 10rpx 15rpx;
	border-radius: 8rpx;
	transition: background-color 0.3s ease;
}

.radio-item:hover {
	background-color: rgba(54, 207, 201, 0.1);
}

.radio-text {
	font-size: 28rpx;
	color: #333;
	margin-left: 15rpx;
	font-weight: 500;
}

/* 单选框选中状态样式 */
radio[checked]+.radio-text {
	color: #36cfc9;
	font-weight: 600;
}

/* 禁用状态样式 */
.radio-group.disabled {
	background-color: #f0f0f0;
	border-color: #d0d0d0;
	opacity: 0.6;
	cursor: not-allowed;
}

.radio-group.disabled .radio-item {
	cursor: not-allowed;
	pointer-events: none;
}

.radio-group.disabled .radio-text {
	color: #999;
}

.radio-group.disabled radio[disabled] {
	opacity: 0.5;
}
</style>