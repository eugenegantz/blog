'use strict';

import { ITableUsersRow } from '../users/lib/interfaces/tables/ITableUsersRow';
import db from '../../../mysql/mysql-pool';


interface ITablePermissionsRow {

	id          : number;
	name        : string;
	user_key    : string;
	user_value  : string;

}


export default {

	_cache: [],


	/**
	 * Проверить наличие прав у пользователя
	 * */
	async validate(user: ITableUsersRow | undefined, permission: string): Promise<boolean> {
		if (!user)
			return false;

		if (!this._cache.length)
			this._cache = await db.query(`SELECT * FROM t_user_permissions`);

		let _permissions: ITablePermissionsRow[] = this._cache;

		return _permissions.some(row => {
			if (row.name !== permission)
				return;

			if ('group' === row.user_key && user.meta.some(a => a.value == row.user_value))
				return true;

			if ('id' === row.user_key && user.id == +row.user_value)
				return true;
		});
	},

}