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
import { ITablePostsRow } from './interfaces/tables/ITablePostsRow';
import { ITablePostsRows } from './interfaces/tables/ITablePostsRows';
import {
	IAPIModulePostsResultStructError,
	IAPIModulePostsGetResultStructSuccess,
	IAPIModulePostsUpsertResultStructSuccess
} from './interfaces/common';


const
	knex = _knex({ client: 'mysql' });


export interface IAPIModulePostsGetArgs extends IArgQueryBuilder {}

export interface IAPIModulePostsUpsertArgs {

	data: ITablePostsRow

}

export interface IMetaProcessorFunc {

	(meta: ITableMetaRows, decl: IMetaProcessorDecl): Promise<ITableMetaRows>;

}

interface IMetaProcessorDecl {

	processor: IMetaProcessorFunc;


	async: boolean;

}


const
	TABLE_NAME_MAIN = 't_posts',
	TABLE_NAME_META = 't_posts_meta';

const _utils = {
	db: {
		queries: _utilsDBQueries,
		scheme: _utilsDBScheme,
	},
};


export class APIModulePosts extends APIModuleStdCRUD {

	_metaProcessors: IMetaProcessorDecl[] = [];


	/**
	 * Получить шаблон объекта записи
	 *
	 * @return {Object} - объект записи
	 * */
	_getPostResTpl(): ITablePostsRow {
		return {
			id:             void 0, // {Number}
			uri:            void 0, // {String}
			title:          void 0, // {String}
			content:        void 0, // {String}
			meta:           [],     // {Array}
		};
	}


	/**
	 * @param {Array} meta
	 *
	 * @return {Promise}
	 * */
	_processingPostMeta(meta: ITableMetaRows): Promise<ITableMetaRows> {
		let _promiseSync = Promise.resolve([]);
		let _promiseAsync = [_promiseSync];

		this._metaProcessors.forEach(decl => {
			let _async      = decl.async;
			let processor   = decl.processor;

			_async
				? _promiseAsync.push(processor(meta, decl))
				: _promiseSync = _promiseSync.then(() => processor(meta, decl));
		});

		return Promise.all(_promiseAsync).then(() => meta);
	}


	/**
	 * Установить обработчик мета-записей
	 *
	 * @param {Function} arg.processor
	 * @param {Boolean} arg.async
	 *
	 * @return {undefined}
	 * */
	registerMetaProcessor(arg: IMetaProcessorDecl): void {
		this._metaProcessors.push(arg);
	}


	/**
	 * Получить метаданные записи. API Версия
	 *
	 * @return {Promise}
	 * */
	async getMeta(arg: IArgQueryBuilder = {}): Promise<{ data: ITableMetaRows }> {
		let opt = {
			tables: {
				main: TABLE_NAME_MAIN,
				meta: TABLE_NAME_META,
			},
		};

		let query                   = this.buildStdMetaTableSelectQuery(null, arg, opt).toString();
		let rows                    = await db.query<ITableMetaRow>(query);

		rows                        = await this._processingPostMeta(rows);

		return { data: rows };
	}


	/**
	 * Получить записи
	 *
	 * @param {Object} args
	 * @param {Object} args.filter
	 * @param {Object} args.params
	 * @param {Object} args.params.orderBy
	 * @param {Number} args.params.perPage
	 * @param {Object} args.params.preprocessMetaValues
	 * @param {Object} args.params.page
	 * @param {Object} args.params.outputFormat
	 *
	 * @return {Promise}
	 * */

	async get(args: IAPIModulePostsGetArgs): Promise<IAPIModulePostsGetResultStructSuccess | IAPIModulePostsResultStructError> {
		args = _.defaultsDeep(_.cloneDeep(args), {
			filter: {
				type: ['post'],
			},
			params: {},
		});

		let tScmMain;
		let tScmMeta;
		let resPosts;
		let resMeta;
		let resAmount;
		let data            = [];
		let count           = 0;
		let postsById       = {};

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
			let query = this.buildStdMainTableSelectQuery(null, args, Object.assign({}, opt, {
				fld: [
					'*',
					knex.raw('UNIX_TIMESTAMP(date) AS date_ts')
				]
			})).toString();

			// Запрос. Таблица мета записей
			query += ';' + this.buildStdMetaTableSelectQuery(null, args, opt).toString();

			// Запрос. Таблица с общее количество записей
			query += ';' + this.buildStdMainTableCountSelectQuery(null, args, opt).toString();

			[resPosts, resMeta, resAmount] = await db.query(query);
		}

		data = resPosts.map(row => {
			row = Object.assign(this._getPostResTpl(), row);

			return postsById[row.id] = row;
		});

		count = resAmount[0]._amount;

		// Обработка меты
		await this._processingPostMeta(resMeta);

		// Привязка меты к постам
		resMeta.forEach(mRow => {
			let post = postsById[mRow.pid];

			if (!post)
				return;

			post.meta = post.meta || [];

			post.meta.push(mRow);
		});

		return {
			data,
			count,
		};
	}


	/**
	 * Обновить или записать запись
	 *
	 * @param {Object} arg
	 * @param {Object} arg.post
	 *
	 * @return {Promise}
	 * */
	async upsert(arg: IAPIModulePostsUpsertArgs): Promise<IAPIModulePostsUpsertResultStructSuccess | IAPIModulePostsResultStructError> {

		let prevPost;
		let tScmMain;
		let tScmMeta;
		let uid             = Math.round(Math.random() * Math.pow(10, 16));
		let post            = arg.data;
		let isNew           = !post.id;

		// Вернуть схемы таблиц
		await Promise.all([
			_utils.db.scheme.getTableScheme(db, TABLE_NAME_MAIN).then(a => tScmMain = a),
			_utils.db.scheme.getTableScheme(db, TABLE_NAME_META).then(a => tScmMeta = a),
		]);

		{
			let query;

			// Если заголовок не указан вернуть ошибку
			if (!post.title)
				return Promise.reject('upsertPost: не указано название записи. Поле "title"');

			if (!post.type)
				return Promise.reject('upsertPost: не указан тип записи. Поле "type"');

			// Если не указан URI установить из заголовка
			if (!post.uri) {
				post.uri = post
					.title
					.replace(/[.-/\\#_;'"!@$%^&*()~]/ig, '')
					.replace(/[\s\t\\/]/ig, '-')
					.toLowerCase();
			}

			if (isNew) {
				// Новая запись в БД
				let _insert = _utils.db.queries.prepareFields(tScmMain, post, {
					omitPrimary: true,
					defaults: {
						uid,
						date: knex.raw('NOW()'),
					},
				});

				query = knex(TABLE_NAME_MAIN).insert(_insert).toString();

			} else {
				// Обновление записи в БД
				let _update = _utils.db.queries.prepareFields(tScmMain, post, {
					omitPrimary: true,
				});

				if (post.date_ts)
					_update.date = knex.raw(`FROM_UNIXTIME(${post.date_ts})`);

				if (Object.keys(_update).length)
					query = knex(TABLE_NAME_MAIN).update(_update).where('id', post.id).toString();
			}

			if (query)
				await db.query(query);
		}

		{
			if (!isNew) {
				prevPost = await this.get({
					filter: {
						id: post.id,
						type: post.type,
					},
				});

				prevPost = prevPost.data;
			}

			let query = knex(TABLE_NAME_MAIN).select('id').where('uid', uid + '').toString();

			let res = await db.query<{ id: number }>(query);

			if (!res.length)
				return Promise.reject('upsertPost: new id not found');

			post.id = res[0].id;
		}

		// Обновление мета записей
		// Ключ meta не передан - ничего не делать
		if ('meta' in post) {
			(post.meta || []).forEach(mRow => mRow.pid = post.id);

			let _query = this.buildStdMetaTableUpsertQueryByDiff({
				meta: {
					prev: _.get(prevPost, 'meta'),
					next: post.meta,
				},
				tables: {
					meta: TABLE_NAME_META,
				},
				scheme: {
					meta: tScmMeta,
				}
			});

			let query = _query.toString();

			if (query)
				await db.query(query);
		}

		return {
			data: {
				id: post.id,
			},
		};
	}


	/**
	 * Удалить записи
	 * */
	async remove(arg: IAPIModulePostsGetArgs): Promise<{} | IAPIModulePostsResultStructError> {
		let id = [].concat(_.get(arg, 'filter.id') || []);

		if (!id.length)
			return {};

		let query = knex(TABLE_NAME_MAIN).del().where('id', 'in', id).toString();

		await db.query(query);

		return {};
	}

}