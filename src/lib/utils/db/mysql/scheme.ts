'use strict';

import { IMySQLTableScheme } from '../../../interfaces/IMySQLTableScheme';
// import { Connection, Pool } from 'mysql';
import { IPool } from '../../../mysql/mysql-pool';

type TGetTableSchemeArg = IPool & { _ispTableScmCache?: object };

interface IShowColumnsRow {
	field       : number;
	type        : string;
	'null'      : string;
	key         : string;
	'default'   : any;
	extra       : string | null;
}

export default {

	_dbStrTypes: {
		CHAR: 1,
		VARCHAR: 1,
		TINYTEXT: 1,
		TEXT: 1,
		MEDIUMTEXT: 1,
		LONGTEXT: 1,
		JSON: 1
	},


	/**
	 * Вернуть схему таблицы из БД
	 *
	 * @param connection - соединение
	 * @param tableName - название таблицы
	 *
	 * @return {Promise} - Promise.resolve(scm)
	 * */
	async getTableScheme(
		connection: TGetTableSchemeArg,
		tableName: string,
	): Promise<IMySQLTableScheme> {
		let scm: IMySQLTableScheme;
		let cache = connection._ispTableScmCache = connection._ispTableScmCache || {};

		if (scm = connection._ispTableScmCache[tableName])
			return scm;

		let res = await connection.query<IShowColumnsRow>(`SHOW COLUMNS FROM \`${tableName}\``);

		scm = cache[tableName] = {
			'null'      : '',
			'default'   : '',
			field       : '',
			type        : '',
			key         : '',
			extra       : '',
		};

		res.forEach(row => {
			row = <IShowColumnsRow>Object.keys(row).reduce((obj, key) => {
				obj[key.toLowerCase()] = row[key];

				return obj;
			}, {});

			row.type = row.type.replace(/\(.+\)/ig, '').toUpperCase();

			scm[row.field] = row;
		});

		return scm;
	},

};