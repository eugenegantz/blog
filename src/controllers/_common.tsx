'use strict';

import React from 'react';
import ReactDOMServer from 'react-dom/server';
import modURL from 'url';
import modFs from 'fs';
import modPath from 'path';
import { PHTMLCommon } from '../ui/components/p-html-common/p-html-common';
import CTXRouter, { reducer } from '../ui/components/ctx-router/ctx-router';
import _utilsReq from '../lib/utils/req';
import { createStore } from 'redux';
import { Provider } from 'react-redux';

const
	// @ts-ignore
	importMetaUrl = import.meta.url;

const
	__filename = modURL.fileURLToPath(importMetaUrl),
	__dirname = modPath.dirname(__filename),
	bundlesDir = modPath.resolve(__dirname, '../../static/bundles/'),
	bundles = {};

(async () => {
	let list: string[] = await (
		new Promise((resolve, reject) => {
			modFs.readdir(bundlesDir, (err, list: string[]) => {
				if (err)
					return reject(err);

				resolve(list);
			})
		})
	);

	let extFilter = {
		'.js': 1,
		'.css': 1,
	};

	list.forEach(file => {
		// main.dda7e9bcce49c7c6a816.bundle.js
		let { name, ext } = modPath.parse(file);
		let [_name] = name.split('.');

		if (!extFilter[ext] || !ext)
			return;

		bundles[_name + ext] = file;
	});
})();


function getRandomIntInclusive(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);

	return Math.floor(Math.random() * (max - min + 1)) + min;
}


export default async function(req, res) {
	req.id = Math.random().toString().replace('0.', '');

	let headItems = Object.keys(bundles).map(key => {
		if (/\.js$/ig.test(key)) {
			return React.createElement('script', {
				key,
				src: modPath.join('/static/bundles/', bundles[key]),
			});
		}

		if (/\.css/ig.test(key)) {
			return React.createElement('link', {
				key,
				rel: 'stylesheet',
				href: modPath.join('/static/bundles/', bundles[key]),
			});
		}
	});

	function getHostURL() {
		let url = _utilsReq.getURLObject(req);

		return url.protocol + '://' + url.hostname + ':' + url.port;
	}

	try {
		let runtimeName = `__serverRuntimeRequest__ctx${req.id}__`;

		let _runtime = {
			[runtimeName]() {
				console.log(`------ <REQUEST id="${req.id}"> ------`);
				let _done = 0;
				let ctxRouterStore = createStore(reducer);

				ctxRouterStore.dispatch({ type: 'init' });
				ctxRouterStore.dispatch({ type: 'setId', id: req.id });

				ReactDOMServer.renderToString(
					<PHTMLCommon headItems={headItems} >
						<Provider store={ctxRouterStore}>
							<CTXRouter
								getHostURL={getHostURL}
								onSSRAwaitResolveAll={() => !_done++ && renderFinally()}
							/>
						</Provider>
					</PHTMLCommon>,
				);

				function renderFinally() {
					res.write('<!DOCTYPE html>');
					ReactDOMServer.renderToNodeStream(
						<PHTMLCommon store={ctxRouterStore} headItems={headItems} >
							<Provider store={ctxRouterStore}>
								<CTXRouter
									getHostURL={getHostURL}
									onSSRAwaitResolveAll={() => console.log(`------ </REQUEST id="${req.id}"> ------`)/null}
								/>
							</Provider>
						</PHTMLCommon>
					).pipe(res);
				}
			}
		};

		_runtime[runtimeName]();

	} catch (err) {
		console.error(err);

		err = err.stack || err.message || (err + '');

		res.set('Content-type', 'text/plain');

		res.send({ err });
	}
};
