// 门票数据
export const CommonTicketing = [{
		"id": "1",
		"name": "单人门票",
		"img": "/static/images/ticket_01.png",
		"price": "35",
		"refer": "仅限单人当天使用 即买即用 无需预约"
	},
	{
		"id": "2",
		"name": "家庭套餐",
		"img": "/static/images/ticket_02.png",
		"price": "70",
		"refer": "包含两大一小 入园赠送儿童水枪一支"
	},
	{
		"id": "3",
		"name": "学生票",
		"img": "/static/images/ticket_03.png",
		"price": "18",
		"refer": "仅限当天使用 凭学生证享受半价优惠"
	},
	{
		"id": "4",
		"name": "老年票",
		"img": "/static/images/ticket_04.png",
		"price": "0",
		"refer": "仅限当天使用 现场验票需出示身份证"
	},
]

// 住房数据
export const CommonHotel = [{
		"id": "1",
		"name": "OwO旅社大床房",
		"img": "/static/images/hotel_01.png",
		"price": "168",
		"refer": "您的经济之选 温馨整洁 24小时热水 WIFI",
		"like": "856",
		"facilities": ["免费WiFi", "24小时热水", "空调", "独立卫浴", "电视", "吹风机"],
		"checkinRules": ["入住时间：14:00后", "退房时间：12:00前", "需提供身份证件", "禁止吸烟", "禁止携带宠物"],
		"services": ["24小时前台服务", "行李寄存", "叫醒服务", "旅游咨询", "免费停车"],
		"introduction": "OwO旅社大床房位于景区核心位置，步行即可到达各大景点。房间温馨舒适，设施齐全，是您经济实惠的住宿首选。房间采用现代简约风格装修，配备舒适大床，让您在游玩一天后能够充分休息。"
	},
	{
		"id": "2",
		"name": "半山湖边-亲子度假房",
		"img": "/static/images/hotel_02.png",
		"price": "388",
		"refer": "可供两大一小入住亲子出行的不二之选",
		"like": "1203",
		"facilities": ["免费WiFi", "湖景阳台", "儿童床", "空调", "冰箱", "微波炉", "洗衣机", "儿童用品"],
		"checkinRules": ["入住时间：15:00后", "退房时间：11:00前", "需提供身份证件", "儿童需有成人陪同", "禁止吸烟"],
		"services": ["亲子活动安排", "儿童托管服务", "湖边垂钓", "免费早餐", "接送服务"],
		"introduction": "半山湖边亲子度假房坐落在风景如画的湖畔，专为家庭出游设计。房间宽敞明亮，配备儿童专用设施，让您和孩子都能享受舒适的住宿体验。推开窗户就能看到碧波荡漾的湖水，是亲子度假的理想选择。"
	},
	{
		"id": "3",
		"name": "林中树屋",
		"img": "/static/images/hotel_03.png",
		"price": "688",
		"refer": "可供3-5人住宿 群林之间 来一次自然的SPA",
		"like": "2156",
		"facilities": ["森林景观", "私人露台", "壁炉", "厨房设施", "BBQ设备", "温泉浴池", "观星天窗"],
		"checkinRules": ["入住时间：16:00后", "退房时间：10:00前", "需提前预约", "禁止明火", "保护环境"],
		"services": ["森林导览", "篝火晚会", "天然温泉", "有机早餐", "瑜伽课程"],
		"introduction": "林中树屋是我们最具特色的住宿体验，建造在茂密的森林中，与大自然完美融合。树屋采用环保材料建造，配备现代化设施，让您在享受原始自然的同时不失舒适。夜晚可以透过天窗观赏满天繁星，是追求独特体验游客的首选。"
	}
]

// 纪念品数据
export const CommonSouvenir = [{
		"id": "1",
		"name": "OwO纪念衫",
		"img": "/static/images/souvenir_01.png",
		"size": ["S", "M", "L", "XL", "XXL"],
		"color": ["red", "blue", "green", "yellow", "black", "white"],
		"price": "59",
		"sale": "3238",
		"like": "1256",
		"introduction": "OwO纪念衫采用优质纯棉面料，柔软舒适，透气性佳。经典的OwO标志设计，简约而不失时尚。无论是日常穿着还是作为纪念收藏，都是您的不二选择。精心设计的版型，适合各种身材，让您穿出自信与个性。",
		"buyingNotes": ["面料：100%纯棉", "洗涤：建议手洗或机洗冷水", "保养：避免高温熨烫", "尺码：请参考尺码表选择", "颜色：实物颜色可能与图片略有差异"],
		"reviews": ["质量很好，面料舒适，颜色鲜艳！", "版型很正，穿着很舒服，值得购买。", "作为纪念品很有意义，设计也很好看。"]
	},
	{
		"id": "2",
		"name": "OwO抱枕",
		"img": "/static/images/souvenir_02.png",
		"size": ["S", "M", "L", "XL", "XXL"],
		"color": ["red", "blue", "green", "yellow", "black", "white"],
		"price": "39",
		"sale": "2109",
		"like": "856",
		"introduction": "OwO抱枕采用高品质填充物，柔软蓬松，回弹性好。可爱的OwO造型设计，既实用又装饰。无论是午休小憩还是居家装饰，都能为您带来温馨舒适的体验。精选面料，亲肤透气，让您享受云朵般的拥抱感受。",
		"buyingNotes": ["填充物：优质PP棉", "面料：短毛绒面料", "清洗：可拆洗枕套", "保养：定期晾晒保持蓬松", "尺寸：多种规格可选"],
		"reviews": ["抱枕很软很舒服，孩子很喜欢！", "质量不错，做工精细，很可爱。", "性价比很高，推荐购买。"]
	},
	{
		"id": "3",
		"name": "OwO纪念钥匙链",
		"img": "/static/images/souvenir_03.png",
		"size": ["S", "M", "L", "XL", "XXL"],
		"color": ["red", "blue", "green", "yellow", "black", "white"],
		"price": "410",
		"sale": "210",
		"like": "432",
		"introduction": "OwO纪念钥匙链采用优质合金材质，表面经过精细抛光处理，光泽持久不褪色。小巧精致的设计，方便携带，是您日常生活的贴心伴侣。独特的OwO标志，彰显您的品味与个性，也是送给朋友的完美小礼品。",
		"buyingNotes": ["材质：优质合金", "工艺：精细抛光处理", "保养：避免接触化学物品", "尺寸：便携小巧设计", "包装：精美礼盒包装"],
		"reviews": ["小巧精致，做工很好！", "价格便宜，质量不错，很满意。", "送朋友的小礼品，很受欢迎。"]
	},
	{
		"id": "4",
		"name": "OwO手机壳",
		"img": "/static/images/souvenir_04.png",
		"size": ["S", "M", "L", "XL", "XXL"],
		"color": ["red", "blue", "green", "yellow", "black", "white"],
		"price": "29",
		"sale": "510",
		"like": "1432",
		"introduction": "OwO手机壳采用环保硅胶材质，贴合手机曲线，保护手机不受磨损。可爱的OwO造型设计，让您在日常生活中增添一份乐趣。多种颜色可选，满足您的个性化需求。",
		"buyingNotes": ["材质：环保硅胶", "尺寸：适配多种手机", "清洗：可拆洗内衬", "保养：避免高温接触", "颜色：多种颜色可选"],
		"reviews": ["手机壳很贴合，保护效果很好！", "设计可爱，颜色鲜艳，很满意。", "性价比很高，推荐购买。"]
	},
	{
		"id": "5",
		"name": "OwO水杯",
		"img": "/static/images/souvenir_05.png",
		"size": ["S", "M", "L", "XL", "XXL"],
		"color": ["red", "blue", "green", "yellow", "black", "white"],
		"price": "49",
		"sale": "610",
		"like": "2156",
		"introduction": "OwO水杯采用高品质玻璃材质，耐热耐冷，安全无毒。可爱的OwO造型设计，让您在喝水的同时增添一份乐趣。多种颜色可选，满足您的个性化需求。",
		"buyingNotes": ["材质：高品质玻璃", "容量：500ml/750ml", "清洗：可放入洗碗机清洗", "保养：避免高温接触", "颜色：多种颜色可选"],
		"reviews": ["水杯很漂亮，质量很好！", "设计可爱，颜色鲜艳，很满意。", "性价比很高，推荐购买。"]
	},
	{
		"id": "6",
		"name": "OwO笔记本",
		"img": "/static/images/souvenir_06.png",
		"size": ["S", "M", "L", "XL", "XXL"],
		"color": ["red", "blue", "green", "yellow", "black", "white"],
		"price": "9",
		"sale": "710",
		"like": "856",
		"introduction": "OwO笔记本采用高品质纸张，书写流畅，不易褪色。可爱的OwO造型设计，让您在记录生活的同时增添一份乐趣。多种颜色可选，满足您的个性化需求。",
		"buyingNotes": ["材质：高品质纸张", "尺寸：A5", "清洗：可放入洗碗机清洗", "保养：避免高温接触", "颜色：多种颜色可选"],
		"reviews": ["笔记本质量很好，纸张书写流畅！", "设计可爱，颜色鲜艳，很满意。", "性价比很高，推荐购买。"]
	}
]

// 游乐项目数据
export const AmusementProjects = [{
		"id": "1",
		"name": "旋转木马",
		"img": "/static/images/amusement_01.png",
		"refer": "刺激体验 身高限制1.4米以上 心脏病患者禁止",
		"like": "1256",
		"introduction": "在流转的童话光影里，旋转木马是爱情的温柔隐喻。每一次起伏回旋，都像恋人初遇时的心跳轨迹——你追逐着我的身影，我守望着你的方向，看似咫尺天涯，却在同一旋律中共舞不息。当彩灯亮起，木马升腾，执手相视的瞬间，时光将见证：真正的爱情从不是追逐游戏，而是纵使轨迹交错，目光始终锁定彼此的坚定轮回。",
		"Guide": ['​​浪漫时段​​：黄昏时分乘坐，暖黄灯串与夕阳交织出梦幻光晕', '​​最佳位置​​：选择双层木马顶层外侧，视野开阔便于拍摄剪影',
			'​​仪式彩蛋​​：在木马升至最高点时轻触伴侣指尖，寓意"触及幸福巅峰"',
			'​​隐藏玩法​​：连续乘坐三轮不同配色木马（白→金→红），象征爱情三境界'
		]
	},
	{
		"id": "2",
		"name": "过山车",
		"img": "/static/images/amusement_02.png",
		"refer": "浪漫之选 俯瞰全景 适合情侣和家庭",
		"like": "2108",
		"introduction": "当列车攀上巅峰又俯冲而下，过山车是少年蜕变的具象寓言。失重瞬间攥紧的双手，离心力中爆发的呐喊，都在雕刻勇气的印记——正如人生必经的跌宕起伏。父母目送孩子挑战极限的背影，见证的不是刺激游戏，而是独立面对未知的成长勋章：唯有直面俯冲的勇气，才能拥抱腾空的辉煌。",
		"Guide": ['​​黄金座位​​：首尾车厢体验最强推背感，中部车厢减少眩晕', '摄影秘诀​​：设置连拍模式抓拍俯冲表情包，出口处可购买动态影像', '​​装备指南​​：穿有拉链口袋服装，戴隐形眼镜比框架更安全',
			'隐藏体验​​：闭眼乘坐感受纯粹失重，刺激感提升30%'
		]
	},
	{
		"id": "3",
		"name": "高空缆车",
		"img": "/static/images/amusement_03.png",
		"refer": "亲子互动 老少皆宜 单次游玩10分钟",
		"like": "856",
		"introduction": "在离地百米的玻璃舱内，缆车化为悬浮的亲情信箱。祖父指点着蚁群般的房屋讲述家族迁徙，孩童惊呼中抓紧母亲的手掌。当缆绳轻颤划破云层，三代人的呼吸在方寸间共振——这缓慢的空中航程，终将沉淀为血脉相连的时空胶囊：原来最动人的风景，是相偎倒映在云镜里的笑颜。",
		"Guide": ['​​绝佳时段​​：雨后初晴乘缆车，云海翻腾如入仙境', '​​包舱技巧​​：4人组队可享私密空间，单程限乘6人', '观景秘籍​​：背阳面座位避反光，携带迷你望远镜观鸟',
			'​​时光仪式​​：录制"空中家书"视频，山顶邮局可寄出实体明信片'
		]
	},
	{
		"id": "4",
		"name": "碰碰车",
		"img": "/static/images/amusement_04.png",
		"refer": "童话梦境 适合儿童 家长可陪同",
		"like": "1432",
		"introduction": "彩色车阵碰撞出咯咯笑声，这里是童稚未凿的快乐原乡。当爷爷握着孙儿的小手猛打方向盘，当奶瓶宝宝在安全椅里手舞足蹈，橡胶轮胎的每次擦碰都在谱写多代同堂的欢乐颂。没有交通规则的世界里，追逐的嬉闹与故意的肇事，都是岁月返老还童的密钥——那些散落车场的七彩星光，原是遗落许久的纯粹欢喜。",
		"Guide": ['战神指南​​：选亮色车辆更易被追击，角落发车突袭成功率高', '亲子法宝​​：双人车后座有婴幼儿防护椅，投币可延长3分钟游戏', '摄影点位​​：二楼环形走廊俯拍，捕捉彩虹漩涡般的车阵',
			'​​怀旧彩蛋​​：找到复古条纹碰碰车，座椅下藏有90年代经典贴纸'
		]
	}
]

//购物车数据
export const cartData = {
	"Ticketing": [{
			"id": "1",
			"type": "单人门票",
			"img": "/static/images/ticket_01.png",
			"count": "1",
			"scheduledTime": "2025-06-19",
			"price": "35"
		},
		{
			"id": "2",
			"type": "学生票",
			"img": "/static/images/ticket_03.png",
			"count": "1",
			"scheduledTime": "2025-06-19",
			"price": "18"
		}
	],
	"Hotel": [{
		"id": "1",
		"type": "OwO旅社大床房",
		"img": "/static/images/hotel_01.png",
		"count": "1",
		"scheduledTime": "2025-06-19",
		"price": "168"
	}],
	"Souvenir": [{
		"id": "1",
		"type": "OwO纪念钥匙链",
		"img": "/static/images/souvenir_03.png",
		"count": "1",
		"model": {
			"size": "S",
			"color": "red"
		},
		"price": "10"
	}]
}

// 用户数据
export const userData = [{
		"id": 1,
		"name": "系统管理员",
		"account": "admin",
		"isAdmin": 1,
		"phone": "13800138000",
		"password": "123456",
		"img": "/static/images/user_img01.jpg",
		"clubDays": 108,
		"points": 1256,
		"likes": 89,
		"coupons": 3,
		"footprints": 42
	},
	{
		"id": 2,
		"name": "测试账户",
		"account": "user",
		"isAdmin": 0,
		"phone": "19107925629",
		"password": "12345678",
		"img": "/static/images/634.jpg",
		"clubDays": 10,
		"points": 10,
		"likes": 2,
		"coupons": 0,
		"footprints": 8
	}
]

// 数据库用户数据模版展示
const MyUserData = [{
		"id": 1,
		"name": "系统管理员",
		"account": "admin",
		"isAdmin": 1,
		"phone": "13800138000",
		"password": "123456",
		"img": "/static/images/user_img01.jpg",
		"clubDays": 108,
		"points": 1256,
		"likes": 89,
		"coupons": 3,
		"footprints": 42
	},
	{
		"id": 2,
		"name": "测试账户",
		"account": "user",
		"isAdmin": 0,
		"phone": "19107925629",
		"password": "12345678",
		"img": "/static/images/634.jpg",
		"clubDays": 10,
		"points": 10,
		"likes": 2,
		"coupons": 0,
		"footprints": 8
	}
]

//数据库购物车数据模版展示
const carts=[
	{
		"id":1,
		"account":"admin"
	},
	{
		"id":2,
		"account":"user"
	}
]
const cart_items=[
	{
		"id":1,
		"cart_id":1,
		"card_id":"15220",
		"category":"Ticketing",
		"type":"单人门票",
		"img":"/static/images/ticket_01.png",
		"count":1,
		"scheduledTime":"2025-06-19",
		"model":null,
		"price":"35.00"
	},
	{
		"id":2,
		"cart_id":1,
		"card_id":"24348",
		"category":"Ticketing",
		"type":"学生票",
		"img":"/static/images/ticket_03.png",
		"count":2,
		"scheduledTime":"2025-06-19",
		"model":null,
		"price":"18.00"
	},
	{
		"id":3,
		"cart_id":1,
		"card_id":"16642",
		"category":"Hotel",
		"type":"OwO旅社大床房",
		"img":"/static/images/hotel_01.png",
		"count":1,
		"scheduledTime":"2025-06-19",
		"model":null,
		"price":"168.00"
	},
	{
		"id":4,
		"cart_id":1,
		"card_id":"17679",
		"category":"Souvenir",
		"type":"OwO纪念钥匙链",
		"img":"/static/images/souvenir_03.png",
		"count":1,
		"scheduledTime":"2025-06-19",
		"model": {
			"size": "S",
			"color": "red"
		},
		"price":"10.00"
	},
	{
		"id":5,
		"cart_id":2,
		"card_id":"18286",
		"category":"Ticketing",
		"type":"单人门票",
		"img":"/static/images/ticket_01.png",
		"count":1,
		"scheduledTime":"2025-06-19",
		"model":null,
		"price":"35.00"
	},
	{
		"id":6,
		"cart_id":2,
		"card_id":"19294",
		"category":"Hotel",
		"type":"OwO旅社大床房",
		"img":"/static/images/hotel_01.png",
		"count":1,
		"scheduledTime":"2025-06-19",
		"model":null,
		"price":"168.00"
	}
]

//数据库待付款订单数据模版展示
const order=[
	{
		"id":1,
		"account":"admin",
	},
	{
		"id":2,
		"account":"user",
	}
]
const order_items=[
	{
		"id":1,
		"order_id":1,
		"card_id":"1750901110325737",
		"name":"单人门票",
		"img":"/static/images/ticket_01.png",
		"count":1,
		"scheduledTime":"2025-06-25",
		"model":null,
		"price":"35.00",
		"payTime":"2025-06-25 10:00:00",
		"status":0
	},
	{
		"id":2,
		"order_id":1,
		"card_id":"1750901110319295",
		"name":"OwO旅社大床房",
		"img":"/static/images/hotel_01.png",
		"count":1,
		"scheduledTime":"2025-06-25",
		"model":null,
		"price":"168.00",
		"payTime":"2025-06-25 10:00:00",
		"status":1
	},
	{
		"id":3,
		"order_id":2,
		"card_id":"1750901110326387",
		"name":"单人门票",
		"img":"/static/images/ticket_01.png",
		"count":1,
		"scheduledTime":"2025-06-25",
		"model":null,
		"price":"35.00",
		"payTime":"2025-06-25 10:00:00",
		"status":1
	},
	{
		"id":4,
		"order_id":2,
		"card_id":"1750901110326388",
		"name":"OwO纪念衫",
		"img":"/static/images/souvenir_01.png",
		"count":1,
		"scheduledTime":"2025-06-25",
		"model":{
			"size": "S",
			"color": "red"
		},
		"price":"59.00",
		"payTime":"2025-06-25 10:00:00",
		"status":0
	}
]

export const CommonCoupons = [
	{ id: 1, name: '新用户专享', description: '满50减10', discount: 10, minAmount: 50 },
	{ id: 2, name: '周末特惠', description: '满100减20', discount: 20, minAmount: 100 },
	{ id: 3, name: '会员专享', description: '满200减50', discount: 50, minAmount: 200 },
	{ id: 4, name: '节日特惠', description: '满300减80', discount: 80, minAmount: 300 },
	{ id: 5, name: '超级会员', description: '满500减150', discount: 150, minAmount: 500 }
]

// 支付方式数据
export const CommonPaymentMethods = [
	{ id: 'wechat', name: '微信支付', emoji: '💬' },
	{ id: 'alipay', name: '支付宝支付', emoji: '💰' },
	{ id: 'bank', name: '银行卡支付', emoji: '💳' },
	{ id: 'qq', name: 'QQ支付', emoji: '🐧' },
	{ id: 'unionpay', name: '云闪付', emoji: '💎' }
]