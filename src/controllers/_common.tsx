'use strict';

import React from 'react';
import ReactDOMServer from 'react-dom/server';
import modURL from 'url';
import modFs from 'fs';
import modPath from 'path';
import { PHTMLCommon } from '../ui/components/p-html-common/p-html-common';
import CTXRouter, { reducer, clearRuntimeContext as clearRouterRuntimeContext } from '../ui/components/ctx-router/ctx-router';
import _utilsReq from '../lib/utils/req';
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
// import { Provider } from 'react-redux';
import { Provider, clearRuntimeContext as clearReduxRuntimeContext } from '../ui/components/ctx-redux/ctx-redux';

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
		let runtimeName1 = `__serverRuntimeRequest__ctx${req.id}__1`;
		let runtimeName2 = `__serverRuntimeRequest__ctx${req.id}__2`;
		let ctxRouterStore = createStore(reducer, applyMiddleware(thunk));

		let _runtime = {
			[runtimeName1]() {
				ctxRouterStore.dispatch({ type: 'init' });
				ctxRouterStore.dispatch({ type: 'setId', id: req.id });
				ctxRouterStore.dispatch({
					type: 'setSSRAwaitCallback',
					callback: () => _runtime[runtimeName2](),
				});

				ReactDOMServer.renderToString(
					<PHTMLCommon headItems={headItems} >
						<Provider store={ctxRouterStore} >
							<CTXRouter getHostURL={getHostURL} />
						</Provider>
					</PHTMLCommon>
				);
			},
			[runtimeName2]() {
				/*
					res.write('<!DOCTYPE html>');
					ReactDOMServer.renderToNodeStream(
						<PHTMLCommon store={ctxRouterStore} headItems={headItems} >
							<Provider store={ctxRouterStore}>
								<CTXRouter
									getHostURL={getHostURL}
									onSSRAwaitResolveAll={() => console.log(`------ </REQUEST id="${req.id}"> ------`)}
								/>
							</Provider>
						</PHTMLCommon>
					).pipe(res);
					*/

				let str = '<!DOCTYPE html>' + ReactDOMServer.renderToString(
					<PHTMLCommon store={ctxRouterStore} headItems={headItems} >
						<Provider store={ctxRouterStore}>
							<CTXRouter getHostURL={getHostURL} />
						</Provider>
					</PHTMLCommon>
				);

				res.send(str);

				clearReduxRuntimeContext();
				clearRouterRuntimeContext();
			}
		};

		_runtime[runtimeName1]();

	} catch (err) {
		console.error(err);

		err = err.stack || err.message || (err + '');

		res.set('Content-type', 'text/plain');

		res.send({ err });
	}
};
