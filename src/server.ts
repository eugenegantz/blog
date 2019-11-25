'use strict';

import './init/root.ts';
import minimist from 'minimist';
import appConfig from '../config/app.js';
import modPath from 'path';
import express from 'express';
import controllerCommon from './controllers/common';
import controllerAPI from './controllers/api';
import initDB from './init/db';


(async () => {
	const
		argv = minimist(process.argv.slice(2)),

		httpServerPort = argv.http_server_port || appConfig.http_server_port,

		app = express();

	app.all('/api/v1', controllerAPI);
	app.all('/', controllerCommon);

	console.log(modPath.resolve(__root, './static/'));

	app.use(
		'/static/',
		express.static(
			modPath.resolve(__root, './static/'),
			{
				maxAge: '2629800000',
			}
		)
	);

	await initDB();

	app.listen(httpServerPort, function() {
		console.log(`[OK] http-server. port: ${httpServerPort}`);
	});
})();