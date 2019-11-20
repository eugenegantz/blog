'use strict';

import { IAPIModuleTestResultStruct } from './interfaces/common';


export class APIModuleTest {

	async random(): Promise<IAPIModuleTestResultStruct> {
		return {
			data: Math.random(),
		};
	}

}