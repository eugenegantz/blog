'use strict';

export default {

	/**
	 * Очистить строку от служебных символов
	 * */
	sanitize(str: string): string {
		if (typeof str == 'string')
			return str.replace(/[\\/;'"]/ig, '');

		return str;
	},


	/**
	 * Очистить строку от служебных символов. В качестве аргумента любые данные
	 * */
	cStrSanitize(str: string): string {
		return this.sanitize((str || '') + '');
	},

}