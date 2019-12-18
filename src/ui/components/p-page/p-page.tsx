'use strict';

import React, { useContext, useEffect } from 'react';
import { Context as RouterContext } from '../ctx-router/ctx-router';
import styles from './p-page.m.css';
import _get from 'lodash/get';

const
	_ = {
		get: _get,
	};

export function PPage(props) {
	let { state } = useContext(RouterContext);
	let { page, pending } = state;

	let content = (pending || !page || !page.content)
		? <div>pending</div>
		: <div>{page.content}</div>;

	let runtimeContextId = new Error().stack.match(/__serverRuntimeRequest__ctx\d+__/ig);

	console.log(runtimeContextId);

	return (
		<div className={styles.body}>
			<div>
				{
					runtimeContextId
				}
			</div>
			<div>
				{
					content
				}
			</div>
		</div>
	)
}