'use strict';

import React, { useContext, useEffect } from 'react';
import { Context as RouterContext } from '../ctx-router/ctx-router';
import styles from './p-page.m.css';
import _get from 'lodash/get';
import pageDeps from '../deps';
import PDefault from '../p-default/p-default';

const
	_ = {
		get: _get,
	};


export function PPage() {
	let PageTemplateComponent;
	let { state } = useContext(RouterContext);
	let { page, pending } = state;
	let isPageReady = (!pending && !!page && page.content !== void 0);

	if (isPageReady) {
		page.meta.some(mRow => {
			if (mRow.key === '_page_template')
				return PageTemplateComponent = pageDeps[mRow.value];
		});
	}

	if (PageTemplateComponent)
		return <PageTemplateComponent page={page} />;

	return <PDefault page={page} pending={!isPageReady} />
}