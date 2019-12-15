import _common from './_common.js';

/**
 * Получить платформу на которой запущен скрипт
 * @return {String}
 * */
export function getExecEnv(): string {
	let ctx             = new Function('return this')();
	let ctxClassName    = Object.prototype.toString.call(ctx);

	// fix: Chrome 48 возвращает [object global] для ctxClassName
	if (ctxClassName != ctx + '')
		ctxClassName = ctx + '';

	if (ctxClassName == '[object Window]')
		return 'browser';

	if (ctxClassName == '[object global]')
		return 'node';
}


/**
 * Запущен ли скрипт в браузере
 * @return {Boolean}
 * */
export function isBrowserEnv(): boolean {
	return getExecEnv() == 'browser';
}


/**
 * Запущен ли скрипт в на сервере (NodeJs)
 * @return {Boolean}
 * */
export function isNodeEnv(): boolean {
	return getExecEnv() == 'node';
}


/**
 * Определить браузер
 * @return {String}
 * */
export function detectBrowser(): string {
	return _common.detectBrowser();
}


export default {
	getExecEnv,
	isBrowserEnv,
	isNodeEnv,
	detectBrowser,
};