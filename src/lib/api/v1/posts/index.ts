'use strict';

import { Request, Response } from 'express';
import { APIModulePosts, IAPIModulePostsUpsertArgs } from './lib/APIModulePosts';
import utilsReq from '../../../utils/req';

const
	posts = new APIModulePosts();


export default {

	_isAuthUsrHasAdminRights(req: Request, res: Response): Promise<boolean> {
		return Promise.resolve(true);
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
		return posts.get(utilsReq.getArgs(req));
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

		return posts.getMeta({
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
		await this._isAuthUsrHasAdminRights(req, res);

		return posts.upsert(<IAPIModulePostsUpsertArgs>utilsReq.getArgs(req));
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
		await this._isAuthUsrHasAdminRights(req, res);

		return posts.remove(utilsReq.getArgs(req));
	}

};