'use strict';

import _ from 'lodash';
import _knex from '../../../../knex/knex';
import { APIModuleStd } from './APIModuleStd';
import _dbUtilsQueries from '../../../../utils/db/mysql/queries';
import { IMySQLTableScheme } from '../../../../interfaces/IMySQLTableScheme';

import {
	IArgBuildStdMetaTableUpsertQueryByDiff,
	IResBuildStdMetaTableUpsertQueryByDiff,
	IArgQueryBuilderFilterValue,
	IArgQueryBuilderOpt,
	IArgQueryBuilder,
	IFieldOperator,
	QueryBuilder,
} from './interfaces/common';


function isEmpty(value: any): boolean {
	return !![].concat(value).join('');
}

const
	knex = _knex({ client: 'mysql' });

const
	_utils = {
		db: {
			queries: _dbUtilsQueries,
		},
	};


export class APIModuleStdCRUD extends APIModuleStd {

	private readonly _dbQueryOperators: object = {
		like: {
			regex: /__like$/i,
			operator: 'like',
		},
		notLike: {
			regex: /__not_like$/i,
			operator: 'not like',
		},
		notIn: {
			regex: /__not_in$/i,
			operator: 'not in',
			handler(query, key, val, op) {
				key = key.replace(op.regex, '');

				return query.andWhere(key, 'not in', val);
			},
		},
		jsonLike: {
			regex: /__json_like$/i,
			handler(query, key, obj, op) {
				if (!Array.isArray(obj))
					obj = [obj];

				query.andWhere(function() {
					obj.forEach(obj => {
						if (typeof obj != 'object')
							return;

						key = key.replace(op.regex, '');

						this.orWhere(function() {
							Object.keys(obj).forEach(prop => {
								let val = obj[prop];

								if (!Array.isArray(val))
									return this.andWhere(key, 'like', `%"${prop}":"${val}"%`);

								this.andWhere(function() {
									val.forEach(val => {
										return this.orWhere(key, 'like', `%"${prop}":"${val}"%`);
									});
								});
							});
						});
					});
				});

				return query;
			}
		}
	};


	/**
	 * Собрать условие запроса: выбрать из основной таблицы по условию из основной таблицы
	 *
	 * @param query
	 * @param {Object} arg
	 * @param {Object=} arg.filter - условие выборки. Поля ключ-значение
	 * @param {Object=} opt
	 * @param {Object=} opt.scheme.main
	 *
	 * @return query
	 * */
	buildStdFilterSelectQueryByFields(query: QueryBuilder, arg: IArgQueryBuilder, opt: IArgQueryBuilderOpt): QueryBuilder {
		this.emit('build-std-filter-select-query-by-fields', query, arg, opt);

		let scm: IMySQLTableScheme | undefined = _.get(opt, 'scheme.main');

		if (!_.get(arg, 'filter'))
			return query;

		// условие по полям из таблицы
		Object.keys(arg.filter).forEach((key: string) => {
			let op;
			let val = arg.filter[key];

			// резервированное поле
			if ('meta' == key)
				return;

			// пропустить void, null, ""
			if (isEmpty(val))
				return;

			op = this.fetchFieldOperator(key);

			if (scm && !this._isSchemeHasField(scm, key, op))
				return;

			val = [].concat(val);

			if (op)
				return this.buildStdFilterKeySelectQueryByOperator(query, key, val, op);

			query.andWhere(key, 'in', val);
		});

		return query;
	}


	/**
	 * Проверить налч
	 *
	 * @param {Object} scm - схема таблицы
	 * @param {String} key
	 * @param {Object} op
	 *
	 * @return {Boolean}
	 * */
	_isSchemeHasField(scm: IMySQLTableScheme, key: string, op) {
		if (op)
			key = key.replace(op.regex, '');

		return !!scm[key];
	}


	/**
	 * Собрать условие запроса: выбрать из таблицы по указанным полям
	 *
	 * @param query - запрос
	 * @param {String} key - ключ
	 * @param {*} val - значение
	 * @param {Object} op - оператор
	 *
	 * @return {query}
	 * */
	buildStdFilterKeySelectQueryByOperator(
		query: QueryBuilder,
		key: string,
		val: IArgQueryBuilderFilterValue,
		op: IFieldOperator | undefined | null
	): QueryBuilder {
		let _val: IArgQueryBuilderFilterValue[] = !Array.isArray(val) ? [val] : val;

		op = op || this.fetchFieldOperator(key);

		if (!op)
			return query;

		if (op.handler)
			return op.handler.call(this, query, key, _val, op);

		key = key.replace(op.regex, '');

		query.andWhere(function() {
			_val.forEach(val => this.orWhere(key, op.operator, val));
		});

		return query;
	}


	/**
	 * Вернуть оператор указанный в составе названия поля.
	 * Вернуть undefined если оператор не найден.
	 *
	 * @param {String} key
	 *
	 * @return {Object | undefined}
	 * */
	fetchFieldOperator(key: string): IFieldOperator | undefined {
		let oper: IFieldOperator = void 0;

		Object.values(this._dbQueryOperators).some((op: IFieldOperator) => {
			if (op.regex.test(key))
				return oper = op;
		});

		return oper;
	}


	fetchFieldKey(key: string, op: IFieldOperator): string {
		key = (key || '') + '';

		if (!op)
			op = this.fetchFieldOperator(key);

		if (op)
			key = key.replace(op.regex, '');

		return key;
	}


	/**
	 * Собрать условия для запроса: выбрать из основной таблицы по условию из мета-таблицы
	 *
	 * @param query
	 * @param {Object} arg
	 * @param {Object=} arg.filter - условие выборки. Поля ключ-значение
	 * @param {Object=} opt
	 * @param {String=} opt.tables.meta - название мета-таблицы
	 *
	 * @return query
	 * */
	buildStdFilterSelectQueryByMeta(
		query: QueryBuilder,
		arg: IArgQueryBuilder,
		opt: IArgQueryBuilderOpt,
	): QueryBuilder {
		let meta        = _.get(arg, 'filter.meta');
		let metaTable   = _.get(opt, 'tables.meta');

		// условие по мета-полям
		if (metaTable && meta) {
			Object.keys(meta).forEach(key => {
				let op: IFieldOperator;
				let val = meta[key];

				// пропустить void, null, ""
				if (isEmpty(val))
					return;

				val = [].concat(val);

				if (op = this.fetchFieldOperator(key)) {
					key = key.replace(op.regex, '');

					let q = knex(metaTable).select('pid').where('key', key);

					this.buildStdFilterKeySelectQueryByOperator(q, 'value', val, op);

					return query.andWhere('id', 'in', q);
				}

				query.andWhere(
					'id', 'in',
					knex(metaTable)
						.select('pid')
						.where('key', key)
						.andWhere('value', 'in', val)
				);
			});
		}

		return query;
	}


	/**
	 * Собрать запрос: выбрать из основной таблицы
	 *
	 * @param query
	 * @param {Object} arg
	 * @param {Object=} arg.filter - условие выборки. Поля ключ-значение
	 * @param {Number} arg.params.page - номер страницы
	 * @param {Number} arg.params.perPage - количесто записей на страницу
	 * @param {Object} arg.params.orderBy - сортировка
	 * @param {Object=} opt
	 * @param {Array} opt.fld - выбираемые поля
	 * @param {String=} opt.tables.main - название основной таблицы
	 * @param {String=} opt.tables.meta - название мета-таблицы
	 *
	 * @return query
	 * */
	buildStdMainTableSelectQuery(
		query: QueryBuilder,
		arg: IArgQueryBuilder,
		opt: IArgQueryBuilderOpt,
	): QueryBuilder {
		query = query || knex.queryBuilder();

		this.emit('build-std-main-table-select-query', query, arg, opt);

		let mainTable   = _.get(opt, 'tables.main');
		let fld         = _.get(opt, 'fld') || _.get(arg, 'params.fld') || ['*'];
		let page        = _.get(arg, 'params.page', 0);
		let perPage     = _.get(arg, 'params.perPage');
		let orderBy     = _.get(arg, 'params.orderBy');

		// from
		if (mainTable)
			query.from(mainTable);

		// перечень полей
		query.select(fld);

		// параметр сортировки
		if (orderBy)
			Object.keys(orderBy).forEach(k => query.orderBy(k, orderBy[k]));

		// параметр длины ответа (постраничная выборка)
		if (perPage)
			query.limit(perPage).offset(page * perPage);

		// условие по полям из таблицы
		this.buildStdFilterSelectQueryByFields(query, arg, opt);

		// условие по мета-полям
		this.buildStdFilterSelectQueryByMeta(query, arg, opt);

		return query;
	}


	/**
	 * Собрать запрос: выбрать из мета-таблицы
	 *
	 * @param query
	 * @param {Object} arg
	 * @param {Object=} arg.filter - условие выборки. Поля ключ-значение
	 * @param {Number} arg.params.page - номер страницы
	 * @param {Number} arg.params.perPage - количесто записей на страницу
	 * @param {Object} arg.params.orderBy - сортировка
	 * @param {Object=} opt
	 * @param {Array} opt.fld - выбираемые поля
	 * @param {String=} opt.tables.main - название основной таблицы
	 * @param {String=} opt.tables.meta - название мета-таблицы
	 *
	 * @return query
	 * */
	buildStdMetaTableSelectQuery(
		query: QueryBuilder,
		arg: IArgQueryBuilder,
		opt: IArgQueryBuilderOpt
	): QueryBuilder {
		query = query || knex.queryBuilder();

		this.emit('build-std-meta-table-select-query', query, arg, opt);

		let fld         = _.get(opt, 'fld') || _.get(arg, 'params.meta.fld') || ['id', 'pid', 'key', 'value', 'class'];
		let metaTable   = _.get(opt, 'tables.meta');
		let mainTable   = _.get(opt, 'tables.main');
		let mainTQuery  = this.buildStdMainTableSelectQuery(null, arg, Object.assign({}, opt, { fld: ['id as post_id'] }));

		if (metaTable)
			query.from(metaTable);

		return query
			.select(fld)
			.innerJoin(mainTQuery.as(mainTable), metaTable + '.pid', mainTable + '.post_id');
	}


	/**
	 * Собрать запрос: количество записей для текущего условия выборки
	 *
	 * @param query
	 * @param {Object} arg
	 * @param {Object=} arg.filter - условие выборки. Поля ключ-значение
	 * @param {Object=} opt
	 * @param {String=} opt.tables.main - название основной таблицы
	 * @param {String=} opt.tables.meta - название мета-таблицы
	 *
	 * @return query
	 * */
	buildStdMainTableCountSelectQuery(
		query: QueryBuilder,
		arg: IArgQueryBuilder,
		opt: IArgQueryBuilderOpt
	): QueryBuilder {
		arg = Object.assign({}, arg);

		opt = _.merge({}, opt, {
			fld: [
				knex.raw('COUNT(*) AS _amount'),
			],
		});

		delete arg.params;

		return this.buildStdMainTableSelectQuery(query, arg, opt);
	}


	/**
	 * Собрать запрос: записать/обновить в мета-таблицу
	 *
	 * @param {Object} arg
	 * @param {Array} arg.meta.prev - текущие (предыдущие) мета-записи
	 * @param {Array} arg.meta.next - новые (переданные под запись) - мета-записи
	 * @param {String} arg.tables.meta - название мета-таблицы
	 * @param {Object} arg.scheme.meta - схема мета-таблицы
	 *
	 * @return {Object}
	 * */
	buildStdMetaTableUpsertQueryByDiff(
		arg: IArgBuildStdMetaTableUpsertQueryByDiff = {
			meta: {
				prev: [],
				next: [],
			},
		}
	): IResBuildStdMetaTableUpsertQueryByDiff {
		arg = _.cloneDeep(arg);

		_.defaultsDeep(arg, {
			meta: {
				prev: [],
				next: [],
			},
			tables: {
				meta: null,
			},
			scheme: {
				meta: null,
			},
		});

		let metaTable       = _.get(arg, 'tables.meta'),
		    tScmMeta        = _.get(arg, 'scheme.meta'),
		    nextMeta        = _.get(arg, 'meta.next', []),
		    prevMeta        = _.get(arg, 'meta.prev', []);

		if (!metaTable)
			throw new Error('buildStdMetaTableUpsertQueryByDiff: !metaTable');

		if (!tScmMeta)
			throw new Error('buildStdMetaTableUpsertQueryByDiff: !tScmMeta');

		let _insert         = [],
		    _update         = [],
		    _delete         = [],
		    prevMetaById    = _.keyBy(prevMeta, 'id'),
		    nextMetaById    = _.keyBy(nextMeta, 'id');

		let res = {
			insert: null,
			update: null,
			'delete': null,
			toString(): string {
				let query = [];

				if (this.insert)
					query.push(this.insert.toString());

				if (this.delete)
					query.push(this.delete.toString());

				if (this.update && this.update.length)
					this.update.forEach(q => query.push(q.toString()));

				return query.join(';');
			},
		};

		// старой строки нет среди новых - удалить
		prevMeta.forEach(mRow => {
			if (!nextMetaById[mRow.id])
				_delete.push(mRow.id);
		});

		nextMeta.forEach(mRow => {
			mRow.class = mRow.class || 'text';

			let prevMRow = prevMetaById[mRow.id];

			// сбросить ложные обновления
			if (mRow.id && !prevMRow)
				delete mRow.id;

			// собрать строки для обновления
			if (mRow.id) {
				// не указан ключ или значение - удалить
				if (!mRow.key || !mRow.value)
					return _delete.push(mRow.id);

				let shouldUpdate = Object.keys(mRow).some(k => mRow[k] != prevMRow[k]);

				if (!shouldUpdate)
					return;

				return _update.push(mRow);
			}

			// не указан ключ или значение - не записывать
			if (!mRow.key || !mRow.value)
				return;

			// собрать строки под запись
			_insert.push(mRow);
		});

		_update = _utils.db.queries.prepareFields(tScmMeta, _update);
		_insert = _utils.db.queries.prepareFields(tScmMeta, _insert, { omitPrimary: true });

		if (_update.length) {
			res.update = [];

			_update.forEach(mRow => {
				res.update.push(
					knex(metaTable)
						.update(mRow)
						.where('id', mRow.id)
				);
			});
		}

		if (_insert.length)
			res.insert = knex(metaTable).insert(_insert);

		if (_delete.length) {
			res.delete = knex(metaTable)
				.del()
				.where('id', 'in', _delete);
		}

		return res;
	}

}