'use strict';

import React from 'react';
import styles from './b-header.m.css';
import { Link } from 'react-router-dom';

export default function BHeader() {
	return (
		<div className={styles.root}>
			<div className={styles['title']}>
				Заголовок
			</div>
			<div className={styles.nav}>
				<div className={styles['nav-item']}>
					<Link to="/">Главная</Link>
				</div>
			</div>
		</div>
	);
}