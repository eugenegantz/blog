'use strict';

import React from 'react';


export default function P404(props) {
	let { page } = props;

	return (
		<div data-title="p-404">
			{
				page.content
			}
		</div>
	)
}