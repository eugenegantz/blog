'use strict';

import styles from './p-html-common.module.css';
import React from 'react';


export class PHTMLCommon extends React.Component {

	render() {
		return (
			<html className={styles.body}>
				<head>
					<meta charSet="UTF-8" />
					<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
					<meta httpEquiv="cache-control" content="public, max-age=2592000" />
				</head>
				<body>
					<div id="app" />
				</body>
			</html>
		);
	}

}