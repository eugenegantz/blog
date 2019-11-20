'use strict';

import { IReqBody } from './IReqBody';


interface IReq {

	method: string

	body: IReqBody

	query: IReqBody

}


export {
	IReq
};