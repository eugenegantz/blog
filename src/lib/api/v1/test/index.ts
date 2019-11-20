'use strict';

import { APIModuleTest } from './lib/APIModuleTest';
import { IAPIModuleTestResultStruct } from './lib/interfaces/common';

const
	api = new APIModuleTest();


export default {

	async random(): Promise<IAPIModuleTestResultStruct> {
		return api.random();
	}

}