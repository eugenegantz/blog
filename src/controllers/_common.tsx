'use strict';

import React from 'react';
import ReactDOMServer from 'react-dom/server';
import modURL from 'url';
import modFs from 'fs';
import modPath from 'path';
import { PHTMLCommon } from '../ui/components/p-html-common/p-html-common';
import { CTXRouter } from '../ui/components/ctx-router/ctx-router';
import _utilsReq from '../lib/utils/req';

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
		let initialState = null;

		(function renderInit() {
			let _done = 0;

			function onSSRAwaitResolveAll(_state) {
				if (_done++)
					return;

				initialState = _state;

				res.send(renderFinally());
			}

			ReactDOMServer.renderToString(
				<PHTMLCommon headItems={headItems} >
					<CTXRouter
						getHostURL={getHostURL}
						onSSRAwaitResolveAll={onSSRAwaitResolveAll}
					/>
				</PHTMLCommon>,
			);
		})();

		function renderFinally() {
			return ''
				+ '<!DOCTYPE html>'
				+ ReactDOMServer.renderToString(
					<PHTMLCommon headItems={headItems} >
						<CTXRouter
							initialState={initialState}
							getHostURL={getHostURL}
						/>
					</PHTMLCommon>,
				);
		}

	} catch (err) {
		console.error(err);

		err = err.stack || err.message || (err + '');

		res.set('Content-type', 'text/plain');

		res.send({ err });
	}
};
