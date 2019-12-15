import _utils from './common';

/**
 * Записать cookie
 *
 * @param {String} name
 * @param {String} value
 * @param {Object=} options
 *
 * @return {String}
 * */
export function setCookie(name, value, options?): string {
	options = options || {};

	let expires = options.expires;

	if (typeof expires == "number" && expires) {
		let d = new Date();

		d.setTime(d.getTime() + expires * 1000);

		expires = options.expires = d;
	}

	if (expires && expires.toUTCString)
		options.expires = expires.toUTCString();

	value = encodeURIComponent(value);

	let updatedCookie = name + "=" + value;

	for (let propName in options) {
		updatedCookie += "; " + propName;

		let propValue = options[propName];

		if (propValue !== true)
			updatedCookie += '=' + propValue;
	}

	document.cookie = updatedCookie;

	return document.cookie;
}


/**
 * Вернуть запись из cookie;
 *
 * @param {String} name
 *
 * @return {String | undefined}
 * */
export function getCookie(name): string | undefined {
	let matches = document.cookie.match(
		new RegExp(
			"(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
		)
	);

	return matches
		? decodeURIComponent(matches[1])
		: void 0;
}


/**
 * Удалить запись из cookie
 *
 * @param {String} name
 *
 * @return {String}
 * */
export function deleteCookie(name): string {
	return setCookie(name, '', {
		expires: -1,
	});
}


/**
 * Проверить включены ли у пользователя cookies
 *
 * @return {Boolean}
 * */
export function isCookiesEnabled(): boolean {
	let isEnabled = true,
		key = 'is-cookies-enabled',
		value = '1';

	if (!_utils.isBrowserEnv())
		return isEnabled;

	setCookie(key, value);

	isEnabled = !!getCookie(key);

	deleteCookie(key);

	return isEnabled;
}


export default {
	isCookiesEnabled,
	deleteCookie,
	getCookie,
	setCookie,
}