'use strict';

import _ from 'lodash';
import api from '../lib/api/v1/index';
import reqUtils from '../lib/utils/req';
import { Request, Response } from 'express';


export default async function(req: Request, res: Response) {
	let params              = reqUtils.getParams(req);
	let method              = params.method;
	let func                = _.get(api, method);

	res.set('Content-type', 'application/json');

	if (typeof func !== 'function') {
		return res.send({
			err: `unknown method "${method}"`,
		});
	}

	try {
		let apiRes = await func(req);

		res.send(JSON.stringify(apiRes));

	} catch (err) {
		console.error(err);

		err = err.stack || err.message || (err + '');

		res.set('Content-type', 'text/plain');

		res.send({ err });
	}
};