'use strict';

import React, { useContext, useEffect } from 'react';
import { getContext as getRouterContext } from '../ctx-router/ctx-router';
import styles from './p-page.m.css';
import _get from 'lodash/get';
import _utilsReq from '../../../lib/utils/req';

const
	_ = {
		get: _get,
	};

export function PPage(props) {
	let { state } = useContext(getRouterContext());
	let { page, pending } = state;

	let content = (pending || !page || !page.content)
		? <div>100200pending</div>
		: <div>{page.content}</div>;

	let runtimeContextId = _utilsReq.getRuntimeContextId();

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