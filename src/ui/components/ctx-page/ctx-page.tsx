'use strict';

import React, { useState } from 'react';
import axios from 'axios';

const
	context = React.createContext(context);


const
	initialState = {
		page: {},
		pending: false,
	};

const
	actions = {

		async setPage(arg) {
			let res = await context.fetchPage(arg);

			context.page = res.data[0];
		},


		async fetchPage(arg) {
			let res = await axios({
				url: '/api/v1/',
				method: 'get',
				headers: {
					'Content-type': 'application/json',
				},
				data: {
					method: 'posts.get',
					argument: arg,
				},
			})
		},

	};


function reducer(state, action) {
	switch (action.type) {
		case 'increment':
			return {count: state.count + 1};
		case 'decrement':
			return {count: state.count - 1};
		default:
			throw new Error();
	}
}

export function CTXPage() {
	let [page, setPage]         = useState(null);
	let [pending, setPending]   = useState(null);

	return (
		<CTXPage.Provider value={context}>
			{
				props.children
			}
		</CTXPage.Provider>
	);
}


export { CTXPage, reducer, actions };