'use strict';

import styles from './p-html-common.m.css';
import React from 'react';


export class PHTMLCommon extends React.Component<{ headItems?: JSX.Element[] }> {

	_renderScriptRedefReactRoot() {
		let __html = `(function(){document.documentElement.removeAttribute('data-reactroot');})();`;

		return <script type="application/javascript" dangerouslySetInnerHTML={{ __html }} />;
	}


	render() {
		let { headItems } = this.props;

		return (
			<html className={styles.body}>
				<head>
					{
						this._renderScriptRedefReactRoot()
					}
					<meta charSet="UTF-8" />
					<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
					<meta httpEquiv="cache-control" content="public, max-age=2592000" />
					{
						headItems
					}
				</head>
				<body>
					<div id="app" data-reactroot />
				</body>
			</html>
		);
	}

}