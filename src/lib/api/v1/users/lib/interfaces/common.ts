'use strict';

import { ITableMetaRows } from '../../../../../interfaces/tables/ITableMetaRows';
import { ITableUsersRows } from './tables/ITableUsersRows';
import { ITableUsersRow } from './tables/ITableUsersRow';


export interface IAPIModuleUsersGetResultStructSuccess {

	data: ITableUsersRows

	count: number,

}


export interface IAPIModuleUsersUpsertResultStructSuccess {

	data: {
		id: number,
	}

}


export type IAPIModuleUsersResultStructError       = Error;
export type IAPIModuleUsersResultStruct            = IAPIModuleUsersGetResultStructSuccess | IAPIModuleUsersResultStructError;