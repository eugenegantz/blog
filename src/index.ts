'use strict';

import minimist from 'minimist';
import appConfig from '../config/app.js';
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

	await initDB();

	app.listen(httpServerPort, function() {
		console.log(`[OK] http-server. port: ${httpServerPort}`);
	});
})();