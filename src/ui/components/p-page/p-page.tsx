'use strict';

import React, { useContext, useEffect } from 'react';
import styles from './p-page.m.css';
import { CTXPage, Context as PageContext } from '../ctx-page/ctx-page';
import _get from 'lodash/get';

const
	_ = {
		get: _get,
	};

export function PPage (props) {
	return (
		<CTXPage>
			<div className={styles.body}>
				<PPageContent />
			</div>
		</CTXPage>
	);
}

function PPageContent() {
	let { state, useSetPage } = useContext(PageContext);
	let { page, pending } = state;
	let skip = false;

	{
		useEffect(() => {
			useSetPage({
				filter: {
					id: 1,
				},
			});

			skip = true;
		}, []);
	}

	if (pending || skip)
		return <div>pending</div>;

	return <div>{page.content}</div>;
}