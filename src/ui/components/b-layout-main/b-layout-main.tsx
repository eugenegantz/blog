'use strict';

import React from 'react';
import BHeader from '../b-header/b-header';
import styles from './b-layout-main.m.css';


export default function BLayoutMain(props) {
	return (
		<div className={styles.body} >
			<BHeader />
			<div className={styles.body}>
				{
					props.children
				}
			</div>
		</div>
	)
}