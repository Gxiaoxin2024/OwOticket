/**
 * 购物车工具类
 * 管理用户独立的购物车数据，集成后端API
 */

import cartService from './cartService.js'

/**
 * 检查用户是否已登录
 * @returns {Object|null} 返回当前用户信息或null
 */
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

/**
 * 获取所有用户数据
 * @returns {Array} 用户数据数组
 */
function getAllUsers() {
	try {
		const usersStr = uni.getStorageSync('users')
		if (usersStr) {
			return JSON.parse(usersStr)
		} else {
			// 如果本地存储中没有用户数据，返回空数组，不自动创建本地存储
			// 避免购物车操作影响其他页面的数据管理
			console.log('本地存储中没有users数据，返回空数组')
			return []
		}
	} catch (error) {
		console.error('获取用户数据失败:', error)
		// 返回空数组，不使用默认数据
		return []
	}
}

/**
 * 保存用户数据
 * @param {Array} users 用户数据数组
 */
function saveAllUsers(users) {
	try {
		uni.setStorageSync('users', JSON.stringify(users))
	} catch (error) {
		console.error('保存用户数据失败:', error)
	}
}

/**
 * 获取当前用户的购物车数据
 * @returns {Promise<Object>} 购物车数据对象
 */
async function getCurrentUserCart() {
	const currentUser = getCurrentUser()
	if (!currentUser) {
		// 未登录用户返回空购物车
		return {
			Ticketing: [],
			Hotel: [],
			Souvenir: []
		}
	}

	try {
		// 优先从后端API获取购物车数据
		const cartData = await cartService.getCart(currentUser.account)
		console.log('从后端获取购物车数据:', cartData)
		return cartData
	} catch (error) {
		console.warn('从后端获取购物车数据失败，使用本地数据:', error)

		// 后端获取失败时，回退到本地存储
		const users = getAllUsers()

		// 如果没有本地users数据，返回空购物车，不创建本地存储
		if (users.length === 0) {
			console.log('没有本地users数据，返回空购物车')
			return {
				Ticketing: [],
				Hotel: [],
				Souvenir: []
			}
		}

		const user = users.find(u => u.account === currentUser.account || u.id === currentUser.id)

		if (!user) {
			return {
				Ticketing: [],
				Hotel: [],
				Souvenir: []
			}
		}

		// 确保购物车结构存在
		if (!user.cart) {
			user.cart = {
				Ticketing: [],
				Hotel: [],
				Souvenir: []
			}
			saveAllUsers(users)
		}

		return user.cart
	}
}

/**
 * 保存当前用户的购物车数据
 * @param {Object} cartData 购物车数据
 * @returns {Promise<boolean>} 保存是否成功
 */
async function saveCurrentUserCart(cartData) {
	const currentUser = getCurrentUser()
	if (!currentUser) {
		console.error('用户未登录，无法保存购物车')
		return false
	}

	try {
		// 注意：cartService没有直接保存整个购物车的API
		// 这里我们只更新本地存储作为缓存，但不修改currentUser
		const users = getAllUsers()

		// 如果没有本地users数据，不进行本地缓存操作，避免创建不必要的本地存储
		if (users.length === 0) {
			console.log('没有本地users数据，跳过本地购物车缓存保存')
			return true
		}

		const userIndex = users.findIndex(u => u.account === currentUser.account || u.id === currentUser.id)

		if (userIndex !== -1) {
			// 更新用户的购物车数据
			users[userIndex].cart = cartData
			// 保存到本地存储
			saveAllUsers(users)
		}

		return true
	} catch (error) {
		console.error('保存购物车数据失败:', error)
		return false
	}
}

/**
 * 添加商品到购物车
 * @param {string} category 商品类别 ('Ticketing', 'Hotel', 'Souvenir')
 * @param {Object} item 商品信息
 * @returns {Promise<boolean>} 添加是否成功
 */
async function addToCart(category, item) {
	const currentUser = getCurrentUser()
	if (!currentUser) {
		uni.showModal({
			title: '提示',
			content: '请先登录后再添加到购物车',
			showCancel: false,
			confirmText: '确定'
		})
		return false
	}

	try {
		// 生成新的购物车项目ID
		const newItemId = Date.now().toString() + Math.floor(Math.random() * 1000).toString()

		// 构建符合后端API的商品数据
		const cartItem = {
			card_id: newItemId,
			category: category,
			type: item.type || item.name,
			img: item.img,
			count: parseInt(item.count) || 1,
			scheduledTime: item.scheduledTime || new Date().toISOString().split('T')[0],
			model: item.model || null,
			price: parseFloat(item.price) || 0
		}

		// console.log('添加商品到购物车:', cartItem)

		// 调用后端API添加商品
		const result = await cartService.addToCart(currentUser.account, cartItem)

		if (result.code === 200) {
			return true
		} else {
			throw new Error(result.message || '添加商品失败')
		}
	} catch (error) {
		console.error('添加商品到购物车失败:', error)

		// API调用失败时，回退到本地存储
		console.log('回退到本地存储添加商品')
		return await addToCartLocal(category, item)
	}
}

/**
 * 本地添加商品到购物车（回退方案）
 * @param {string} category 商品类别
 * @param {Object} item 商品信息
 * @returns {Promise<boolean>} 添加是否成功
 */
async function addToCartLocal(category, item) {
	try {
		const cartData = await getCurrentUserCart()

		// 确保分类存在
		if (!cartData[category]) {
			cartData[category] = []
		}

		// 生成新的购物车项目ID
		const newItemId = Date.now().toString() + Math.floor(Math.random() * 1000).toString()

		// 创建购物车项目
		const cartItem = {
			id: newItemId,
			...item
		}

		// 检查是否已存在相同商品（根据不同类别的判断逻辑）
		let existingItemIndex = -1

		if (category === 'Ticketing') {
			// 门票：相同type和scheduledTime
			existingItemIndex = cartData[category].findIndex(existingItem =>
				existingItem.type === cartItem.type && existingItem.scheduledTime === cartItem.scheduledTime
			)
		} else if (category === 'Hotel') {
			// 住宿：相同type和scheduledTime
			existingItemIndex = cartData[category].findIndex(existingItem =>
				existingItem.type === cartItem.type && existingItem.scheduledTime === cartItem.scheduledTime
			)
		} else if (category === 'Souvenir') {
			// 纪念品：相同type和model
			existingItemIndex = cartData[category].findIndex(existingItem =>
				existingItem.type === cartItem.type &&
				JSON.stringify(existingItem.model) === JSON.stringify(cartItem.model)
			)
		}

		if (existingItemIndex !== -1) {
			// 如果已存在，增加数量
			const existingCount = parseInt(cartData[category][existingItemIndex].count)
			const newCount = existingCount + parseInt(cartItem.count)
			cartData[category][existingItemIndex].count = newCount.toString()
		} else {
			// 如果不存在，添加新项目
			cartData[category].push(cartItem)
		}

		// 保存购物车数据
		return await saveCurrentUserCart(cartData)
	} catch (error) {
		console.error('本地添加商品失败:', error)
		return false
	}
}

/**
 * 从购物车删除商品
 * @param {string} category 商品类别
 * @param {string} itemId 商品ID (对于后端API，这是card_id)
 * @returns {Promise<boolean>} 删除是否成功
 */
async function removeFromCart(category, itemId) {
	const currentUser = getCurrentUser()
	if (!currentUser) {
		return false
	}

	try {
		// 优先使用后端API删除
		const result = await cartService.removeFromCart(itemId)

		if (result.code === 200) {
			return true
		} else {
			throw new Error(result.message || '删除商品失败')
		}
	} catch (error) {
		console.error('后端删除商品失败，使用本地删除:', error)

		// 回退到本地删除
		return await removeFromCartLocal(category, itemId)
	}
}

/**
 * 本地删除商品（回退方案）
 * @param {string} category 商品类别
 * @param {string} itemId 商品ID
 * @returns {Promise<boolean>} 删除是否成功
 */
async function removeFromCartLocal(category, itemId) {
	try {
		const cartData = await getCurrentUserCart()

		if (!cartData[category]) {
			return false
		}

		const itemIndex = cartData[category].findIndex(item => item.id === itemId || item.card_id === itemId)
		if (itemIndex === -1) {
			return false
		}

		cartData[category].splice(itemIndex, 1)
		return await saveCurrentUserCart(cartData)
	} catch (error) {
		console.error('本地删除商品失败:', error)
		return false
	}
}

/**
 * 更新购物车商品数量
 * @param {string} category 商品类别
 * @param {string} itemId 商品ID (对于后端API，这是card_id)
 * @param {number} quantity 新数量
 * @returns {Promise<boolean>} 更新是否成功
 */
async function updateCartItemQuantity(category, itemId, quantity) {
	const currentUser = getCurrentUser()
	if (!currentUser) {
		return false
	}

	if (quantity <= 0) {
		// 数量为0或负数时删除商品
		return await removeFromCart(category, itemId)
	}

	try {
		// 优先使用后端API更新
		const result = await cartService.updateCartItem(itemId, { count: quantity })

		if (result.code === 200) {
			console.log('商品数量更新成功:', result)
			return true
		} else {
			throw new Error(result.message || '更新商品数量失败')
		}
	} catch (error) {
		console.error('后端更新商品数量失败，使用本地更新:', error)

		// 回退到本地更新
		return await updateCartItemQuantityLocal(category, itemId, quantity)
	}
}

/**
 * 本地更新购物车商品数量（回退方案）
 * @param {string} category 商品类别
 * @param {string} itemId 商品ID
 * @param {number} quantity 新数量
 * @returns {Promise<boolean>} 更新是否成功
 */
async function updateCartItemQuantityLocal(category, itemId, quantity) {
	try {
		const cartData = await getCurrentUserCart()

		if (!cartData[category]) {
			return false
		}

		const item = cartData[category].find(item => item.id === itemId || item.card_id === itemId)
		if (!item) {
			return false
		}

		item.count = quantity.toString()
		return await saveCurrentUserCart(cartData)
	} catch (error) {
		console.error('本地更新商品数量失败:', error)
		return false
	}
}

/**
 * 清空购物车
 * @param {string} category 可选，指定清空的类别，不传则清空所有
 * @returns {Promise<boolean>} 清空是否成功
 */
async function clearCart(category = null) {
	try {
		const cartData = await getCurrentUserCart()

		if (category) {
			cartData[category] = []
		} else {
			cartData.Ticketing = []
			cartData.Hotel = []
			cartData.Souvenir = []
		}

		return await saveCurrentUserCart(cartData)
	} catch (error) {
		console.error('清空购物车失败:', error)
		return false
	}
}

/**
 * 获取购物车商品总数
 * @returns {Promise<number>} 商品总数
 */
async function getCartItemCount() {
	try {
		const cartData = await getCurrentUserCart()

		let totalCount = 0
		Object.keys(cartData).forEach(category => {
			if (cartData[category] && Array.isArray(cartData[category])) {
				cartData[category].forEach(item => {
					totalCount += parseInt(item.count) || 0
				})
			}
		})

		return totalCount
	} catch (error) {
		console.error('获取购物车商品总数失败:', error)
		return 0
	}
}

/**
 * 检查购物车是否为空
 * @returns {Promise<boolean>} 是否为空
 */
async function isCartEmpty() {
	try {
		const cartData = await getCurrentUserCart()

		return (!cartData.Ticketing || cartData.Ticketing.length === 0) &&
			   (!cartData.Hotel || cartData.Hotel.length === 0) &&
			   (!cartData.Souvenir || cartData.Souvenir.length === 0)
	} catch (error) {
		console.error('检查购物车是否为空失败:', error)
		return true
	}
}

/**
 * 根据card_id查找购物车商品
 * @param {string} cardId 商品card_id
 * @returns {Promise<Object|null>} 商品信息和所在分类
 */
async function findCartItemByCardId(cardId) {
	try {
		const cartData = await getCurrentUserCart()

		for (const category of ['Ticketing', 'Hotel', 'Souvenir']) {
			if (cartData[category]) {
				const item = cartData[category].find(item => item.card_id === cardId || item.id === cardId)
				if (item) {
					return { item, category }
				}
			}
		}

		return null
	} catch (error) {
		console.error('查找购物车商品失败:', error)
		return null
	}
}

/**
 * 获取购物车总价
 * @returns {Promise<number>} 总价
 */
async function getCartTotalPrice() {
	try {
		const cartData = await getCurrentUserCart()
		return cartService.calculateTotal(cartData)
	} catch (error) {
		console.error('计算购物车总价失败:', error)
		return 0
	}
}

/**
 * 刷新购物车数据（从后端重新获取）
 * @returns {Promise<Object>} 最新的购物车数据
 */
async function refreshCartData() {
	const currentUser = getCurrentUser()
	if (!currentUser) {
		return {
			Ticketing: [],
			Hotel: [],
			Souvenir: []
		}
	}

	try {
		const cartData = await cartService.getCart(currentUser.account)
		// 同步到本地存储
		await saveCurrentUserCart(cartData)
		return cartData
	} catch (error) {
		console.error('刷新购物车数据失败:', error)
		// 返回本地数据
		return await getCurrentUserCart()
	}
}

/**
 * 同步当前用户数据（从后端重新获取用户信息）
 * @returns {Promise<Object|null>} 最新的用户数据
 */
async function syncCurrentUserData() {
	const currentUser = getCurrentUser()
	if (!currentUser) {
		return null
	}

	try {
		// 导入userService来获取最新用户数据
		const userService = (await import('./userUtils.js')).default
		const users = await userService.getAllUsers()
		const latestUserInfo = users.find(user => user.account === currentUser.account)

		if (latestUserInfo) {
			// 更新本地存储中的用户信息
			uni.setStorageSync('currentUser', JSON.stringify(latestUserInfo))
			return latestUserInfo
		} else {
			console.warn('在后端未找到当前用户数据')
			return currentUser
		}
	} catch (error) {
		console.error('同步用户数据失败:', error)
		return currentUser
	}
}

/**
 * 快速添加商品到购物车（用于商品详情页等）
 * @param {Object} product 商品信息
 * @param {string} product.id 商品ID
 * @param {string} product.name 商品名称
 * @param {string} product.img 商品图片
 * @param {number} product.price 商品价格
 * @param {string} category 商品类别
 * @param {Object} options 可选参数
 * @param {number} options.count 数量，默认1
 * @param {string} options.scheduledTime 预定时间
 * @param {Object} options.model 商品规格（纪念品用）
 * @returns {Promise<boolean>} 添加是否成功
 */
async function quickAddToCart(product, category, options = {}) {
	const {
		count = 1,
		scheduledTime = new Date().toISOString().split('T')[0],
		model = null
	} = options

	const cartItem = {
		type: product.name,
		img: product.img,
		price: product.price,
		count: count,
		scheduledTime: scheduledTime,
		model: model
	}

	try {
		const success = await addToCart(category, cartItem)
		if (success) {
			uni.showToast({
				title: '已添加到购物车',
				icon: 'success'
			})
		}
		return success
	} catch (error) {
		console.error('快速添加到购物车失败:', error)
		uni.showToast({
			title: '添加失败，请重试',
			icon: 'none'
		})
		return false
	}
}

/**
 * 删除用户的所有购物车数据
 * @param {string} account 用户账号
 * @returns {Promise<boolean>} 删除是否成功
 */
async function deleteUserCartData(account) {
	if (!account) {
		console.error('删除用户购物车数据失败: 缺少账号参数')
		return false
	}

	try {
		// 优先使用后端API删除用户所有购物车数据
		const result = await cartService.deleteUserCartData(account)

		if (result.code === 200) {
			console.log('用户购物车数据删除成功:', result.message)

			// 同时清理本地存储中的购物车数据
			await clearLocalUserCartData(account)

			return true
		} else {
			throw new Error(result.message || '删除用户购物车数据失败')
		}
	} catch (error) {
		console.error('后端删除用户购物车数据失败，尝试本地删除:', error)

		// 回退到本地删除
		return await clearLocalUserCartData(account)
	}
}

/**
 * 清理本地存储中的用户购物车数据（回退方案）
 * @param {string} account 用户账号
 * @returns {Promise<boolean>} 清理是否成功
 */
async function clearLocalUserCartData(account) {
	try {
		const users = getAllUsers()

		// 如果没有本地users数据，直接返回成功，不创建本地存储
		if (users.length === 0) {
			console.log('没有本地users数据，跳过本地购物车清理')
			return true
		}

		const userIndex = users.findIndex(u => u.account === account || u.id === account)

		if (userIndex !== -1) {
			// 清空用户的购物车数据
			users[userIndex].cart = {
				Ticketing: [],
				Hotel: [],
				Souvenir: []
			}

			// 保存到本地存储
			saveAllUsers(users)

			console.log('用户购物车数据已从本地缓存清理')
		}

		console.log('本地用户购物车数据清理成功')
		return true
	} catch (error) {
		console.error('本地清理用户购物车数据失败:', error)
		return false
	}
}

export {
	getCurrentUser,
	getCurrentUserCart,
	saveCurrentUserCart,
	addToCart,
	removeFromCart,
	updateCartItemQuantity,
	clearCart,
	getCartItemCount,
	isCartEmpty,
	findCartItemByCardId,
	getCartTotalPrice,
	refreshCartData,
	syncCurrentUserData,
	quickAddToCart,
	deleteUserCartData
}
