'use strict';

// import { IReq } from '../interfaces/IReq';
import { IReqBody } from '../interfaces/IReqBody';
import { Request } from 'express';

type TGetArgsResult = { [key: string]: any };


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
	}

};