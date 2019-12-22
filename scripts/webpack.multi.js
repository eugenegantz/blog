'use strict';

const
	minimist                    = require('minimist'),
	argv                        = minimist(process.argv.slice(2)),
	webpack                     = require('webpack'),
	configServer                = require('./webpack.server.config'),
	configBrowser               = require('./webpack.browser.config');

let shouldWatch = !!+argv.watch;

const compiler = webpack([
	configServer,
	configBrowser,
]);

{
	let callback = (err, stats) => {
		if (err) {
			console.error(err);
			return;
		}

		console.log(
			stats.toString({
				chunks: false,  // Makes the build much quieter
				colors: true,   // Shows colors in the console
			})
		);
	};

	shouldWatch
		? compiler.watch(void 0, callback)
		: compiler.run(callback);
}