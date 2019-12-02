'use strict';

import { Request, Response } from 'express';
import { APIModulePosts, IAPIModulePostsUpsertArgs } from './lib/APIModulePosts';
import utilsReq from '../../../utils/req';
import userPermissions from '../user-permissions/user-permissions';
import apiPosts from './lib/posts';
import apiUsers from '../users/lib/users';
import { ITableUsersRow } from '../users/lib/interfaces/tables/ITableUsersRow';


export default {

	async _getUser(req: Request, res: Response): Promise<ITableUsersRow> {
		let userId = req.session.userId;

		let user = await apiUsers.get({
			filter: {
				id: userId,
			},
			cache: true,
		});

		return user.data[0];
	},


	/**
	 * Вернуть записи
	 *
	 * argument = {
	 *     filter: {
	 *         // {Array | Number=}
	 *         id: [22, 89],
	 *
	 *         // {Array | String=}
	 *         uri: ['biz-cards', 'banners'],
	 *
	 *         // {Array | String=}
	 *         title: ['Визитные карточки', 'Баннеры'],
	 *     },
	 *
	 *     // {Object=}
	 *     params: {
	 *         orderBy: {
	 *             id: 'DESC',
	 *         }
	 *
	 *         // {Number} - записей на странице
	 *         postsPerPage: 10,
	 *
	 *         // {Number} - номер страницы
	 *         page: 1,
	 *     }
	 * }
	 * */
	get(req: Request, res: Response) {
		return apiPosts.get(utilsReq.getArgs(req));
	},


	/**
	 * Вернуть мета-записи
	 *
	 * argument = {
	 *     // {Array=}
	 *     id: [20, 31],
	 *
	 *     // {Array=}
	 *     uri: ['biz-cards', 'banners'],
	 * }
	 * */
	getMeta(req: Request, res: Response) {
		let args = utilsReq.getArgs(req);

		return apiPosts.getMeta({
			filter: {
				id: args.id,
				uri: args.uri,
			}
		});
	},


	/**
	 * Обновить или записать записи
	 *
	 * argument: {
	 *     post: {
	 *         // {Number=}
	 *         // не указан - новая запись
	 *         // указан - обновить существующую
	 *         id: 2293,
	 *
	 *         // {String}
	 *         uri: 'nature',
	 *
	 *         // {String}
	 *         title: 'Природа',
	 *
	 *         // {String}
	 *         type: 'post',
	 *
	 *         // {String}
	 *         content: 'Lorem Ipsum ...',
	 *     }
	 * }
	 * */
	async upsert(req: Request, res: Response) {
		let userRow = await this._getUser(req, res);
		let hasRight = await userPermissions.validate(userRow, 'edit_posts');

		if (!hasRight)
			return Promise.reject('!rights');

		return apiPosts.upsert(<IAPIModulePostsUpsertArgs>utilsReq.getArgs(req));
	},


	/**
	 * Удалить записи
	 *
	 * argument = {
	 *     // {Array}
	 *     id: [1011, 2138, 3398]
	 * }
	 * */
	async remove(req: Request, res: Response) {
		let userRow = await this._getUser(req, res);
		let hasRight = await userPermissions.validate(userRow, 'edit_posts');

		if (!hasRight)
			return Promise.reject('!rights');

		return apiPosts.remove(utilsReq.getArgs(req));
	}

};