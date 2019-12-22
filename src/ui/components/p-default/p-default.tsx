'use strict';

import React from 'react';
import BLayoutMain from '../b-layout-main/b-layout-main';

export default function PDefault(props) {
	let { page, pending } = props;

	if (pending)
		return <div>pending</div>;

	return (
		<BLayoutMain>
			<div dangerouslySetInnerHTML={{ __html: page.content }} />
		</BLayoutMain>
	);
}