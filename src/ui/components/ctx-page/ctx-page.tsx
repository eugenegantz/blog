'use strict';

import React, { useState, useEffect, useReducer } from 'react';
import axios from 'axios';

const
	initialState = {
		page: {},
		pending: false,
	};

const
	_reduce = {
		setPending(state, { pending }) {
			return { pending };
		},
		setPage(state, { page }) {
			return { page };
		},
	};

function reducer(state, action) {
	if (!_reduce[action.type])
		throw new Error(`unknown action "${action.type}"`);

	return _reduce[action.type](state, action);
}


export const Context = React.createContext(null);


export function CTXPage(props) {
	const [state, dispatch] = useReducer(reducer, initialState);

	async function useSetPage(arg) {
		dispatch({ type: 'setPending', pending: true });

		let res     = await useFetchPage(arg);
		let page    = res.data.data[0];

		dispatch({ type: 'setPage', page });
		dispatch({ type: 'setPending', pending: false });
	}

	async function useFetchPage(arg) {
		return await axios({
			url: '/api/v1/',
			method: 'get',
			headers: {
				'Content-type': 'application/json',
			},
			data: JSON.stringify({
				method: 'posts.get',
				argument: arg,
			}),
		});
	}

	let value = {
		state,
		dispatch,
		useSetPage,
		useFetchPage,
	};

	return (
		<Context.Provider value={value} >
			{
				props.children
			}
		</Context.Provider>
	);
}