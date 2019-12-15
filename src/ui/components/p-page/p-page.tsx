'use strict';

import React, { useContext, useEffect } from 'react';
import { Context as PageRouterContext } from '../ctx-router/ctx-router';
import styles from './p-page.m.css';
import _get from 'lodash/get';

const
	_ = {
		get: _get,
	};

export function PPage(props) {
	let { state } = useContext(PageRouterContext);
	let { page, pending } = state;

	let content = (pending || !page || !page.content)
		? <div>pending</div>
		: <div>{page.content}</div>;

	return (
		<div className={styles.body}>
			{
				content
			}
		</div>
	)
}