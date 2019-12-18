'use strict';

import React, { useReducer, useContext, useEffect } from 'react';
import { isBrowserEnv } from '../../../lib/utils/common';
import axios from 'axios';
import produce from 'immer';
import { PPage } from '../p-page/p-page';
import * as _reactRouterDOM from 'react-router-dom';
import * as _reactRouterServer from 'react-router';
import {
	Provider,
	useSelector,
	useDispatch,
	useStore,
	createStoreHook,
	createDispatchHook,
	createSelectorHook,
} from 'react-redux';

const
	COMPONENT_NAME = 'ctx-router';

let StaticRouter, BrowserRouter, useHistory, useLocation, useParams, useRouteMatch, Switch, Route, Router;

let _isBrowserEnv               = isBrowserEnv();
let _onSSRAwaitResolveAll       = () => {};
let _ssrAwait                   = {};

if (_isBrowserEnv) {
	(
		{
			BrowserRouter,
			useHistory,
			useLocation,
			useParams,
			useRouteMatch,
			Switch,
			Route,
		} = _reactRouterDOM
	);

	Router = BrowserRouter;

} else {
	(
		{
			StaticRouter,
			useHistory,
			useLocation,
			useParams,
			useRouteMatch,
			Switch,
			Route,
		} = _reactRouterServer
	);

	Router = StaticRouter;
}


// ----------------------


const
	initialState = {
		page: {},
		pending: false,
	};

const
	_reduce = {
		init(state, { initialState }) {
			return produce(state, state => {
				return initialState || state;
			});
		},
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

export function reducer(state, action) {
	state = state || initialState;

	if (!_reduce[action.type])
		return;
		// throw new Error(`unknown action "${action.type}"`);

	return _reduce[action.type](state, action);
}


// ----------------------


export const Context = React.createContext(null);


export default function CTXRouter(props) {
	let dispatch    = useDispatch();
	let state       = useSelector(s => s);

	async function useSetPage(arg) {
		dispatch({ type: 'setPending', pending: true });

		let page = await useFetchPage(arg);

		dispatch({ type: 'setPage', page });
		dispatch({ type: 'setPending', pending: false });
	}

	async function useFetchPage(arg) {
		let response = await axios({
			url: useGetHostURL() + '/api/v1/',
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

		let a = res.data[0];

		a.content += new Date();

		return a;
	}

	function useSSRAwait(name) {
		_ssrAwait[name] = true;
	}

	function useSSRResolve(name) {
		delete _ssrAwait[name];

		if (!Object.keys(_ssrAwait).length)
			_onSSRAwaitResolveAll();
	}

	function useGetHostURL() {
		if (props.getHostURL)
			return props.getHostURL();

		return '';
	}

	if (props.onSSRAwaitResolveAll)
		_onSSRAwaitResolveAll = props.onSSRAwaitResolveAll;

	let value = {
		state,
		dispatch,
		useHistory      : useHistory,
		useLocation     : useLocation,
		useParams       : useParams,
		useRouteMatch   : useRouteMatch,
		useSetPage,
		useFetchPage,
		useSSRAwait,
		useSSRResolve,
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
	let {
		state,
		useParams,
		useSetPage,
		useSSRAwait,
		useSSRResolve,
	} = useContext(Context);

	let {
		page,
		pending,
	} = state;

	let isPageReady = !pending && !!page && !!page.uri;

	let routerParams = useParams();

	let _useEffect = () => {
		(async () => {
			useSSRAwait('page-request');

			if (!isPageReady) {
				await useSetPage({
					filter: {
						uri: routerParams[0],
					},
				});
			}

			useSSRResolve('page-request');
		})();
	};

	_isBrowserEnv
		? useEffect(_useEffect, [])
		: _useEffect();

	return props.children;
}