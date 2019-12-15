'use strict';

import React, { useReducer, useContext, useEffect } from 'react';
import _utilsCommon from '../../../lib/utils/common';
import axios from 'axios';
import produce from 'immer';
// import * as _reactRouter from "react-router";
// import * as _reactRouterDOM from 'react-router-dom';
import { PPage } from '../p-page/p-page';
import {
	BrowserRouter as Router,
	useHistory,
	useLocation,
	useParams,
	useRouteMatch,
	Switch,
	Route,
	Link,
} from 'react-router-dom'
let isBrowserEnv = _utilsCommon.isBrowserEnv();
let reactRouter;
// let Router, useHistory, useLocation, useParams, useRouteMatch, Switch, Route, Link;
/*
	({
		BrowserRouter,
		useHistory,
		useLocation,
		useParams,
		useRouteMatch,
		Switch,
		Route,
		Link,
	}) = _reactRouterDOM;
* */

/*
reactRouter = isBrowserEnv
	? _reactRouterDOM
	: _reactRouter;*/

// ----------------------

const
	initialState = {
		page: {},
		pending: false,
	};

const
	_reduce = {
		setPending(state, { pending }) {
			return produce(state, state => {
				state.pending = pending;
			});
		},
		setPage(state, { page }) {
			return produce(state, state => {
				state.page = page;
			});
		},
	};

function reducer(state, action) {
	if (!_reduce[action.type])
		throw new Error(`unknown action "${action.type}"`);

	return _reduce[action.type](state, action);
}

// ----------------------

export const Context = React.createContext(null);

export function CTXRouter(props) {
	const [state, dispatch] = useReducer(reducer, initialState);

	async function useSetPage(arg) {
		dispatch({ type: 'setPending', pending: true });

		let page = await useFetchPage(arg);

		dispatch({ type: 'setPage', page });
		dispatch({ type: 'setPending', pending: false });
	}

	async function useFetchPage(arg) {
		let response = await axios({
			url: '/api/v1/',
			method: 'get',
			headers: {
				'Content-type': 'application/json',
			},
			params: {
				method: 'posts.get',
				argument: arg,
			},
		});

		let res = response.data;

		if (res.err)
			throw new Error(res.err);

		if (!res.data[0])
			throw new Error('!page');

		return res.data[0];
	}

	let value = {
		state,
		dispatch,
		useHistory      : useHistory,
		useLocation     : useLocation,
		useParams       : useParams,
		useRouteMatch   : useRouteMatch,
		useSetPage,
		useFetchPage,
	};

	return (
		<Context.Provider value={value} >
			<Router>
				<Switch>
					<Route path="**">
						<RouteBody>
							<PPage />
						</RouteBody>
					</Route>
				</Switch>
			</Router>
		</Context.Provider>
	);
}


function RouteBody(props) {
	let { useParams, useSetPage } = useContext(Context);
	let routerParams = useParams();

	useEffect(() => {
		useSetPage({
			filter: {
				uri: routerParams[0],
			},
		});
	}, []);

	return props.children;
}