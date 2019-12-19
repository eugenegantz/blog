'use strict';

// import { IReq } from '../interfaces/IReq';
import { IReqBody } from '../interfaces/IReqBody';
import { Request } from 'express';

type TGetArgsResult = { [key: string]: any };


const PROXY_HEADERS = {
	'x-forwarded-for': true,
	'x-forwarded-proto': true,
	'x-real-ip': true,
};


export default {

	getReqParams(req: Request): IReqBody {
		let method = req.method.toLowerCase();

		return 'post' === method ? req.body : req.query;
	},


	getParams(req: Request): IReqBody {
		return this.getReqParams(req);
	},


	getArgs(req: Request): TGetArgsResult {
		return this.getParams(req).argument || {};
	},


	/**
	 * Проверить: поступил ли данный вопрос из прокси-сервера?
	 *
	 * @param {IncomingMessage} req
	 *
	 * @return {Boolean}
	 * */
	isProxyRequest(req): boolean {
		let headers;

		if (!(headers = req.headers))
			return false;

		for (let key in headers) {
			key = key.toLowerCase();

			if (PROXY_HEADERS[key])
				return true;
		}

		return false;
	},


	getURLObjectFromProxyRequest(req) {
		let obj = this.getURLObject(req);

		obj.protocol = req.headers['x-forwarded-proto'];

		return obj;
	},


	/**
	 * @param {IncomingMessage} req
	 *
	 * @return {Object}
	 * */
	getURLObject(req) {
		let obj = {
			protocol        : req.protocol,
			hostname        : null,
			port            : null,
			pathname        : req.path,
			query           : req.query,
		};

		if (req.get('host')) {
			let [hostname, port = null] = req.get('host').split(':');

			obj.hostname = hostname;
			obj.port = port;
		}

		return obj;
	},


	getRuntimeContextId(): string {
		return ((new Error().stack.match(/__serverRuntimeRequest__ctx\d+__/ig) || '') + '').replace('__serverRuntimeRequest__ctx', '').replace('__', '') || 'default';
	},

};