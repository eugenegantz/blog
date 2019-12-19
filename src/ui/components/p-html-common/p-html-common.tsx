'use strict';

import styles from './p-html-common.m.css';
import React from 'react';
import { Store } from 'redux';

interface IProps {
	children                ?: any,
	headItems               ?: JSX.Element[],
	onSSRAwaitResolveAll    ?: () => void,
	getHostURL              ?: () => string,
	store                   ?: Store,
}

function _renderScriptRedefReactRoot() {
	let __html = `(function(){document.documentElement.removeAttribute('data-reactroot');})();`;

	return (
		<script
			type="application/javascript"
			dangerouslySetInnerHTML={{ __html }}
		/>
	);
}

const
	noop = () => {};

export function PHTMLCommon (props: IProps) {
	let {
		headItems,
		store,
	} = props;

	let reduxStateScript = void 0;

	if (store) {
		reduxStateScript = `__REDUX_PRELOADED_STATE__ = ${JSON.stringify(store.getState())};`;
	}


	return (
		<html className={styles.body}>
		<head>
			<link rel="shortcut icon" href="about:blank" type="image/x-icon"/>
			{
				_renderScriptRedefReactRoot()
			}
			<script type="application/javascript" dangerouslySetInnerHTML={{ __html: reduxStateScript }} />
			<meta charSet="UTF-8" />
			<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
			<meta httpEquiv="cache-control" content="public, max-age=2592000" />
			{
				headItems
			}
		</head>
		<body>
			<div id="app" data-reactroot >
				{
					props.children
				}
			</div>
		</body>
		</html>
	);
}