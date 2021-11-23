export const getSessionIDFromCookie = (cookie) => {
	if (cookie) {
		return cookie.split('.')[1].substring(8);
	} else {
		throw 'empty cookie';
	}
}