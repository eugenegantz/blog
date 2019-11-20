'use strict';

import { ITableMetaRows } from '../../../../../../interfaces/tables/ITableMetaRows';

export interface ITablePostsRow {
	id                  ?: number | undefined
	uri                 ?: string | undefined
	title               ?: string | undefined
	content             ?: string | undefined
	date                ?: string | undefined
	date_ts             ?: number
	meta                ?: ITableMetaRows | undefined
	type                ?: string | undefined
}