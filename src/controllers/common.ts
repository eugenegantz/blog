
'use strict';

import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { PHTMLCommon } from '../ui/components/p-html-common/p-html-common';


export default async function(req, res) {
	try {
		let html = ''
			+ '<!DOCTYPE html>'
			+ ReactDOMServer.renderToString(
				React.createElement(PHTMLCommon, {})
			);

		res.send(html);

	} catch (err) {
		err += '';

		res.send({ err });
	}
};
