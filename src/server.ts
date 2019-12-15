'use strict';

import './init/root.ts';
import db from './lib/mysql/mysql-pool';
import minimist from 'minimist';
import appConfig from '../config/app.js';
import modPath from 'path';
import bodyParser from 'body-parser';
import express from 'express';
import expressSession from 'express-session';
import _expressMySQLSession from 'express-mysql-session';
import controllerCommon from './controllers/common';
import controllerAPI from './controllers/api';
import initDB from './init/db';

const
	// костыль - @types для библитеки написан с ошибками
	expressMySQLSession: any = _expressMySQLSession;


(async () => {
	await initDB();

	const
		argv                    = minimist(process.argv.slice(2)),
		httpServerPort          = argv.http_server_port || appConfig.http_server_port,
		MySQLStore              = expressMySQLSession(expressSession),
		app                     = express();

	const
		sessionStore = new MySQLStore({
			schema: {
				tableName           : 't_express_sessions',
				columnNames: {
					session_id      : 'session_id',
					expires         : 'expires',
					data            : 'data',
				},
			},
		}, db.pool);

	app.use(bodyParser.json());

	app.use(
		'/static/',
		express.static(
			modPath.resolve(__root, './static/'),
			{
				maxAge: '2629800000',
			}
		)
	);

	app.all('/api/v1', controllerAPI);
	app.all('/*', controllerCommon);

	app.listen(httpServerPort, function() {
		console.log(`[OK] http-server. port: ${httpServerPort}`);
	});
})();