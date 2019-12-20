'use strict';

import React from 'react';

export default function PDefault(props) {
	let { page, pending } = props;

	if (pending)
		return <div>pending</div>;

	return <div dangerouslySetInnerHTML={{ __html: page.content }} />
}