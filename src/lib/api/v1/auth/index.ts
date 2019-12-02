'use strict';

import appConfig from '../../../../../config/app.js';
import { Request, Response } from 'express';
import errorsRegistry from './errors';
import _utilsReq from '../../../utils/req';
import _utilsDbString from '../../../utils/db/string';
import db from '../../../mysql/mysql-pool';
import _knex from '../../../knex/knex';
import modCrypto from 'crypto';
import { ITableUsersRow } from '../users/lib/interfaces/tables/ITableUsersRow';

interface ITableUsersRowResult extends ITableUsersRow {
	date_x: number;
}

const
	knex = _knex({ client: 'mysql' }),

	utils = {
		req: _utilsReq,
		db: {
			string: _utilsDbString,
		},
	};


function _getPasswordHash(pwd: string, salt: string, pepper: string): string {
	return modCrypto.createHash('sha1').update(pwd + ':' + salt + ':' + pepper).digest('hex');
}


export default {

	/**
	 * Авторизация
	 * */
	async login(req: Request, res: Response) {
		let args = utils.req.getArgs(req);

		if (args.login || args.password)
			return this._loginByLoginPwd(req, res);

		return this._loginBySid(req, res);
	},


	/**
	 * Авторизация по паролю и логину (тел., e-mail)
	 * */
	async _loginByLoginPwd(req: Request, res: Response): Promise<void> {
		let sessEmail;
		let expiresTs: Date;
		let args                = utils.req.getArgs(req);
		let argLogin            = args.login;
		let argPassword         = args.password;
		let argExpires          = args.body.expires;
		let argExpiresInterval  = args.body.expiresInterval;
		let session             = req.session;

		argLogin = utils.db.string.cStrSanitize(argLogin);

		let query = knex.queryBuilder();

		query.from('t_users');
		query.select(['*', `UNIX_TIMESTAMP(date) AS date_x`]);
		query.where('tel', argLogin);
		query.orWhere('email', argLogin);

		query = query.toString();

		let dbres                               = await db.query<ITableUsersRowResult>(query);
		let dbUserRow                           = dbres[0];

		// Пользователь не найден
		if (!dbUserRow)
			return Promise.reject(errorsRegistry.createError({ code: '38844566467951513' }));

		let expectedPasswordHash                = _getPasswordHash(argPassword, dbUserRow.date_x, appConfig.password_pepper);
		let dbPasswordHash                      = dbUserRow.hash;

		// Пароль не совпадает
		if (expectedPasswordHash !== dbPasswordHash)
			return Promise.reject(errorsRegistry.createError({ code: '4669908729208754' }));

		sessEmail = dbUserRow.email;

		if (session) {
			session.userId = dbUserRow.id;

			if (argExpiresInterval)
				expiresTs = new Date(Date.now() + (+argExpiresInterval));

			else if (argExpires)
				expiresTs = new Date(+argExpires);

			if (expiresTs) {
				session.cookie.expires = expiresTs;
				session.touch();
			}

			session.save(err => {
				if (err)
					console.error(err);
			});
		}
	},


	/**
	 * Авторизация по коду сессии
	 * */
	async _loginBySid(req, res): Promise<void> {
		let args = utils.req.getArgs(req);

		if (!req.session || !req.session.userId) {
			await this.logout(req, res);

			return Promise.reject({ code: '9216347928410324' });
		}
	},


	/**
	 * Отозвать авторизацию
	 * */
	async logout(req: Request, res: Response): Promise<void> {
		if (req.session) {
			delete req.session.userId;

			req.sessionStore.destroy(req.sessionID, () => {
				req.session.destroy(() => {});
			});
		}
	},

}