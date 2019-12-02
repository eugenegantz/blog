'use strict';

import _ from 'lodash';
import _knex from '../../../../knex/knex';
import _utilsDBScheme from '../../../../utils/db/mysql/scheme';
import _utilsDBQueries from '../../../../utils/db/mysql/queries';
import db from '../../../../mysql/mysql-pool';
import { APIModuleStdCRUD } from '../../std/lib/APIModuleStdCRUD';
import { ITableMetaRows } from '../../../../interfaces/tables/ITableMetaRows';
import { ITableMetaRow } from '../../../../interfaces/tables/ITableMetaRow';
import { IArgQueryBuilder } from '../../std/lib/interfaces/common';
import { ITableUsersRow } from './interfaces/tables/ITableUsersRow';
import { ITableUsersRows } from './interfaces/tables/ITableUsersRows';
import {
	IAPIModuleUsersResultStructError,
	IAPIModuleUsersGetResultStructSuccess,
	IAPIModuleUsersUpsertResultStructSuccess
} from './interfaces/common';


const
	knex = _knex({ client: 'mysql' });


export interface IAPIModuleUsersGetArgs extends IArgQueryBuilder {

	cache?: boolean;

}


const
	TABLE_NAME_MAIN = 't_users',
	TABLE_NAME_META = 't_users_meta';

const _utils = {
	db: {
		queries: _utilsDBQueries,
		scheme: _utilsDBScheme,
	},
};




export class APIModuleUsers extends APIModuleStdCRUD {

	private _getMainRowResTemplate(): ITableUsersRow {
		return {
			id      : 0,
			name    : '',
			date    : '',
			meta    : [],
			email   : '',
			tel     : '',
			hash    : '',
		};
	}


	async get(args: IAPIModuleUsersGetArgs) {
		let cacheKey = this.createCacheKeyFromArg(args);
		let useCache = args.cache;

		// Если доступно, вернуть ответ из кэша
		if (useCache && this.lruCache.has(cacheKey))
			return this.lruCache.get(cacheKey);

		args = _.defaultsDeep(_.cloneDeep(args), {
			params: {},
		});

		let tScmMain;
		let tScmMeta;
		let resMain;
		let resMeta;
		let resAmount;
		let data                = [];
		let count               = 0;
		let mainEntriesById     = {};

		// Если запришвать данные постранично но не сортировать
		// - данные будут возвращены в порядке в котором записаны индексы в БД
		if ((args.params.perPage || args.params.page) && !args.params.orderBy)
			args.params.orderBy = { id: 'DESC' };

		await Promise.all([
			_utils.db.scheme.getTableScheme(db, TABLE_NAME_MAIN).then(a => tScmMain = a),
			_utils.db.scheme.getTableScheme(db, TABLE_NAME_META).then(a => tScmMeta = a),
		]);

		{
			let opt = {
				tables: {
					main: TABLE_NAME_MAIN,
					meta: TABLE_NAME_META,
				},
				scheme: {
					main: tScmMain,
					meta: tScmMeta,
				},
			};

			// Запрос. Основная таблица
			let query = this.buildStdMainTableSelectQuery(null, args, opt).toString();

			// Запрос. Таблица мета записей
			query += ';' + this.buildStdMetaTableSelectQuery(null, args, opt).toString();

			// Запрос. Таблица с общее количество записей
			query += ';' + this.buildStdMainTableCountSelectQuery(null, args, opt).toString();

			[resMain, resMeta, resAmount] = await db.query(query);
		}

		data = resMain.map(row => {
			row = Object.assign(this._getMainRowResTemplate(), row);

			return mainEntriesById[row.id] = row;
		});

		count = resAmount[0]._amount;

		// Обработка меты
		await this.processingPostMeta(resMeta);

		// Привязка меты к постам
		resMeta.forEach(mRow => {
			let entry = mainEntriesById[mRow.pid];

			if (!entry)
				return;

			entry.meta = entry.meta || [];

			entry.meta.push(mRow);
		});

		let res = {
			data,
			count,
		};

		// если требуется, записать ответ в кэш
		if (useCache)
			this.lruCache.set(cacheKey, res);

		return res;
	}

}