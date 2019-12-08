'use strict';

import React from 'react';
import ReactDOMServer from 'react-dom/server';
import modURL from 'url';
import modFs from 'fs';
import modPath from 'path';
import { PHTMLCommon } from '../ui/components/p-html-common/p-html-common';

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

	try {
		let html = ''
			+ '<!DOCTYPE html>'
			+ ReactDOMServer.renderToString(
				React.createElement(PHTMLCommon, {
					headItems,
				})
			);

		res.send(html);

	} catch (err) {
		console.error(err);

		err = err.stack || err.message || (err + '');

		res.set('Content-type', 'text/plain');

		res.send({ err });
	}
};
