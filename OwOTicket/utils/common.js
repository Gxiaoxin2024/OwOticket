// 跳转到门票详情页面
function goToTicketDetails(ticket) {

	uni.navigateTo({
		url: `/pages/TicketDetails/TicketDetails?id=${ticket.id}`
	})
}

// 跳转到门票详情页面
function goToHotelDetails(Hotel) {

	uni.navigateTo({
		url: `/pages/HotelDetails/HotelDetails?id=${Hotel.id}`
	})
}

// 跳转到纪念品详情页面
function goToSouvenirDetails(Souvenir) {

	uni.navigateTo({
		url: `/pages/SouvenirDetails/SouvenirDetails?id=${Souvenir.id}`
	})
}
export {
	goToTicketDetails,
	goToHotelDetails,
	goToSouvenirDetails
}