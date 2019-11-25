'use strict';

import React from 'react';
import styles from './p-page.css';


export class PPage extends React.Component {

	render() {
		return (
			<div className={styles.body}>
				{
					new Date
				}
			</div>
		);
	}

}