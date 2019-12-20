'use strict';

import { ITableMetaRows } from '../../../../../interfaces/tables/ITableMetaRows';
import { ITablePostsRows } from './tables/ITablePostsRows';
import { ITablePostsRow } from './tables/ITablePostsRow';


export namespace APIModulePosts {

	export namespace Get {

		export interface StructResponseSuccess {

			data: ITablePostsRows;

			count: number;

		}

		export type StructResponseError = { err?: (string | null) };

		export type StructResponseResult = StructResponseSuccess & StructResponseError;

	}


	export namespace Upsert {

		export interface StructResponseSuccess {

			data: {
				id: number,
			}

		}

		export type StructResponseError = { err?: (string | null) };

		export type StructResponseResult = StructResponseSuccess & StructResponseError;

	}


	export namespace Remove {

		export interface StructResponseSuccess {}

		export type StructResponseError = Error;

		export type StructResponseResult = StructResponseSuccess | StructResponseError;

	}

}