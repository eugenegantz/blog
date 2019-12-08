'use strict';

import { ITableMetaRows } from '../../../../../interfaces/tables/ITableMetaRows';
import { ITableUsersRows } from './tables/ITableUsersRows';
import { ITableUsersRow } from './tables/ITableUsersRow';

export namespace APIModuleUsers {

	export namespace Get {

		export interface StructResponseSuccess {

			data: ITableUsersRows

			count: number,

		}

		export type StructResponseError = Error;

		export type StructResponseResult = StructResponseSuccess;

	}

	export namespace Upsert {

		export interface StructResponseSuccess {

			data: {
				id: number,
			}

		}

		export type StructResponseError = Error;

		export type StructResponseResult = StructResponseSuccess;

	}

}


