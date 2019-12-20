'use strict';

import React from 'react';
import ReactDOMServer from 'react-dom/server';
import modURL from 'url';
import modFs from 'fs';
import modPath from 'path';
import { PHTMLCommon } from '../ui/components/p-html-common/p-html-common';
import CTXRouter, { reducer as routerReducer, COMPONENT_NAME as R_COMPONENT_NAME } from '../ui/components/ctx-router/ctx-router';
import _utilsReq from '../lib/utils/req';
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';
import { createReducer } from '../ui/reducers/reducers';

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
		let rootReducer = createReducer();
		let ctxRouterStore = createStore(rootReducer, applyMiddleware(thunk));

		ctxRouterStore.reducer = rootReducer;

		// Иначе ON_SSR_READY некуда будет записывать свое состояние
		ctxRouterStore.reducer.add(R_COMPONENT_NAME, routerReducer);
		ctxRouterStore.dispatch({ namespace: R_COMPONENT_NAME, type: 'INIT' });
		ctxRouterStore.dispatch({ namespace: R_COMPONENT_NAME, type: 'ON_SSR_READY', callback: _send });

		ctxRouterStore.dispatch({
			namespace: R_COMPONENT_NAME,
			type: 'MERGE',
			state: {
				getLocation() {
					let url = _utilsReq.getURLObject(req);

					return {
						pathname: url.pathname,
						search: url.query,
						hash: '',
						state: void 0,
					};
				},
			},
		});

		ReactDOMServer.renderToString(
			<PHTMLCommon headItems={headItems} >
				<Provider store={ctxRouterStore} >
					<CTXRouter getHostURL={getHostURL} />
				</Provider>
			</PHTMLCommon>
		);

		function _send() {
			res.write('<!DOCTYPE html>');
			ReactDOMServer.renderToNodeStream(
				<PHTMLCommon store={ctxRouterStore} headItems={headItems} >
					<Provider store={ctxRouterStore}>
						<CTXRouter getHostURL={getHostURL} />
					</Provider>
				</PHTMLCommon>
			).pipe(res);
		}

	} catch (err) {
		console.error(err);

		err = err.stack || err.message || (err + '');

		res.set('Content-type', 'text/plain');

		res.send({ err });
	}
};
