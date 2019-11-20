'use strict';

import { ITableMetaRows } from '../../../../../interfaces/tables/ITableMetaRows';
import { ITablePostsRows } from './tables/ITablePostsRows';
import { ITablePostsRow } from './tables/ITablePostsRow';


export interface IAPIModulePostsGetResultStructSuccess {

	data: ITablePostsRows

	count: number,

}


export interface IAPIModulePostsUpsertResultStructSuccess {

	data: {
		id: number,
	}

}


export type IAPIModulePostsResultStructError       = Error;
export type IAPIModulePostsResultStruct            = IAPIModulePostsGetResultStructSuccess | IAPIModulePostsResultStructError;