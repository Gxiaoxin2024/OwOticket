/**
 * OwOTicket 路由拦截器
 * 功能：控制页面访问权限，未登录用户访问受保护页面时跳转到登录页
 */

// 页面白名单 - 无需登录即可访问的页面
const whiteList = [
	'/pages/index/index', // 首页
	'/pages/LoginPage/LoginPage', // 登录注册页
	'/pages/Ticketing/Ticketing', // 门票页面
	'/pages/Hotel/Hotel', // 住宿页面
	'/pages/Souvenir/Souvenir', // 纪念品页面
	'/pages/mine/mine', // 个人中心
]

// 需要登录才能访问的页面
const protectedPages = [
	'/pages/myCart/myCart', // 购物车
	'/pages/ProjectDetails/ProjectDetails', // 项目详情页
	'/pages/TicketDetails/TicketDetails', // 门票详情页
	'/pages/HotelDetails/HotelDetails', // 住宿详情页
	'/pages/SouvenirDetails/SouvenirDetails' // 纪念品详情页
]

/**
 * 检查用户是否有访问权限
 * @param {string} url - 要访问的页面路径
 * @returns {boolean} - 是否有权限访问
 */
function hasPermission(url) {
	try {
		// 检查是否在白名单中
		if (isInWhiteList(url)) {
			return true
		}

		// 检查是否为受保护页面
		if (isProtectedPage(url)) {
			return isUserLoggedIn()
		}

		// 默认允许访问（其他页面）
		return true
	} catch (error) {
		console.error('权限检查失败:', error)
		return false
	}
}

/**
 * 检查页面是否在白名单中
 * @param {string} url - 页面路径
 * @returns {boolean}
 */
function isInWhiteList(url) {
	return whiteList.some(whitePage => {
		// 支持精确匹配和路径匹配（忽略参数）
		return url === whitePage || url.startsWith(whitePage + '?')
	})
}

/**
 * 检查页面是否为受保护页面
 * @param {string} url - 页面路径
 * @returns {boolean}
 */
function isProtectedPage(url) {
	return protectedPages.some(protectedPage => {
		return url === protectedPage || url.startsWith(protectedPage + '?')
	})
}

/**
 * 检查用户是否已登录
 * @returns {boolean}
 */
function isUserLoggedIn() {
	try {
		const token = uni.getStorageSync('token')
		const currentUser = uni.getStorageSync('currentUser')

		// 检查token是否存在且有效
		if (!token || token.trim() === '') {
			return false
		}

		// 检查用户信息是否存在
		if (!currentUser || currentUser.trim() === '') {
			return false
		}

		// 可以在这里添加token有效性验证
		// 例如：检查token是否过期等

		return true
	} catch (error) {
		console.error('登录状态检查失败:', error)
		return false
	}
}

/**
 * 处理未授权访问
 * @param {string} url - 尝试访问的页面路径
 */
function handleUnauthorizedAccess(url) {
	// 显示提示信息
	uni.showToast({
		title: '请先登录后再访问',
		icon: 'none',
		duration: 2000
	})

	// 延迟跳转到登录页，让用户看到提示
	setTimeout(() => {
		uni.reLaunch({
			url: '/pages/LoginPage/LoginPage'
		})
	}, 500)

	console.log(`未授权访问被拦截: ${url}`)
}

/**
 * 通用拦截处理函数
 * @param {object} e - 拦截事件对象
 * @returns {boolean} - 是否允许继续执行
 */
function interceptHandler(e) {
	const url = e.url

	if (!hasPermission(url)) {
		handleUnauthorizedAccess(url)
		return false
	}

	return true
}

// 拦截 navigateTo（普通页面跳转）
uni.addInterceptor('navigateTo', {
	invoke: interceptHandler,
	success(e) {
		// console.log('navigateTo 成功:', e.url)
	},
	fail(e) {
		console.error('navigateTo 失败:', e)
	}
})

// 拦截 switchTab（tabbar页面跳转）
uni.addInterceptor('switchTab', {
	invoke: interceptHandler,
	success(e) {
		// console.log('switchTab 成功:', e.url)
	},
	fail(e) {
		console.error('switchTab 失败:', e)
	}
})

// 拦截 reLaunch（重新启动应用）
uni.addInterceptor('reLaunch', {
	invoke: interceptHandler,
	success(e) {
		// console.log('reLaunch 成功:', e.url)
	},
	fail(e) {
		console.error('reLaunch 失败:', e)
	}
})

// 拦截 redirectTo（重定向）
uni.addInterceptor('redirectTo', {
	invoke: interceptHandler,
	success(e) {
		// console.log('redirectTo 成功:', e.url)
	},
	fail(e) {
		console.error('redirectTo 失败:', e)
	}
})

// 导出工具函数，供其他模块使用
export {
	hasPermission,
	isUserLoggedIn,
	isInWhiteList,
	isProtectedPage
}