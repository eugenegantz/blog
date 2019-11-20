'use strict';

import mysql, { Pool } from 'mysql';
import dbConfig from '../../../config/db.js';

const pool = mysql.createPool(Object.assign(
	{
		connectionLimit : 10,
		multipleStatements: true
	},
	dbConfig.dbconfigs[0]
));


export interface IPool {

	pool: Pool,

	query: Function

}


export default {
	pool,
	query<TRow>(query: string): Promise<(TRow & object)[]> {
		return (
			new Promise((resolve, reject) => {
				this.pool.query(query, (err, res, fields) => {
					if (err)
						return reject(err);

					resolve(res);
				});
			})
		);
	}
};