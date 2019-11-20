'use strict';

import _ from 'lodash'


interface prepareFieldsArgOpt extends Object {

	replace?: boolean,


	omitPrimary?: boolean,


	omit?: string[],


	assign?: boolean,


	defaults?: object

}


export default {

	/**
	 * Подготовить поля записи
	 *
	 * @param {Object} scm - схема таблицы БД
	 * @param {Object | Array} rows - строки под запись
	 * @param {Object=} opt
	 * @param {Boolean=false} opt.omitPrimary - исключить поля типа PRIMARY
	 * @param {Object} opt.defaults - значение ключей по умолчанию
	 * @param {Object} opt.assign - перезаписать ключи
	 * @param {Array=} opt.omit - исключить поля
	 *
	 * @return {Array | Object} - rows
	 * */
	prepareFields(
		scm: object,
		rows: (object[] | object) = [],
		opt: prepareFieldsArgOpt = {}
	) {
		let pick;

		let {
			replace,
			omitPrimary,
			omit = [],
			assign,
			defaults
		} = opt;

		let _rows = [].concat(rows || []);

		pick = Object.keys(scm);

		if (omitPrimary) {
			pick.some(fld => {
				if (scm[fld].key == 'PRI')
					return omit.push(fld);
			});
		}

		_rows = _rows.reduce((arr, row) => {
			// Оставить только задекларированные поля
			// Исключить указанные поля и пустые сущности
			if (!_.isPlainObject(row))
				return arr;

			row = _.omit(_.pick(row, pick), omit);

			if (defaults)
				_.defaults(row, defaults);

			if (assign)
				Object.assign(row, assign);

			if (replace)
				Object.keys(replace).forEach(k => (row[k] in replace[k]) && (row[k] = replace[k][row[k]]));

			arr.push(row);

			return arr;
		}, []);

		if (Array.isArray(rows))
			return _rows;

		return _rows[0];
	},

};