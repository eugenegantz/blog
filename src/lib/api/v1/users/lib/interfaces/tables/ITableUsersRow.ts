'use strict';

import { ITableMetaRows } from '../../../../../../interfaces/tables/ITableMetaRows';

export interface ITableUsersRow {
	id                  : number;
	name                : string;
	date                : string;
	tel                 ?: string;
	email               ?: string;
	hash                : string;
	meta                : ITableMetaRows;
}