'use strict';

import qs from 'qs';
import { IAPIModulePostsGetArgs } from '../../../lib/api/v1/posts/lib/APIModulePosts';
import { APIModulePosts } from '../../../lib/api/v1/posts/lib/interfaces/common';
import { ITablePostsRow } from '../../../lib/api/v1/posts/lib/interfaces/tables/ITablePostsRow';
import React, { useReducer, useContext, useEffect } from 'react';
import { isBrowserEnv } from '../../../lib/utils/common';
import axios, { AxiosResponse } from 'axios';
import { reducer } from './reducer';
import { PPage } from '../p-page/p-page';
import * as _reactRouterDOM from 'react-router-dom';
import * as _reactRouterServer from 'react-router';
import {
	useSelector as _useSelector,
	useDispatch as _useDispatch,
	useStore,
} from 'react-redux';

const
	_isBrowserEnv = isBrowserEnv();

// ----------------------


interface IGetLocationResult {
	pathname: string;
	search: string;
	hash: string;
	state: any;
}


// ----------------------


export { reducer };
export const COMPONENT_NAME = 'ctx-router';
export const Context = React.createContext(null);


// ----------------------


let StaticRouter, BrowserRouter, useHistory, useLocation, useParams, useRouteMatch, Switch, Route, Router;

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


function useDispatch() {
	let dispatch = _useDispatch();

	return function(action) {
		return dispatch(
			Object.assign(action, {
				namespace: COMPONENT_NAME,
			})
		);
	}
}


function useSelector(func) {
	return _useSelector(state => func(state[COMPONENT_NAME]));
}


// ----------------------


const PAGE_404 = {
	id: -1,
	uid: null,
	title: 'Страница не найдено',
	uri: '404',
	type: 'post',
	content: 'Страница не найдена',
	date: new Date() + '',
	date_ts: Date.now(),
	meta: [
		{
			value: 'p-404',
			key: '_page_template',
		}
	],
};


export default function CTXRouter(props) {
	let dispatch    = useDispatch();
	let store       = useStore();
	let state       = useSelector(s => s);

	if (!store.reducer.has(COMPONENT_NAME, reducer)) {
		store.reducer.add(COMPONENT_NAME, reducer);
		dispatch({ type: 'INIT' });
	}

	function useSetPage({ page }): void {
		dispatch({ type: 'SET_PAGE', page });
	}

	async function useGoToPage(arg: IAPIModulePostsGetArgs): Promise<void> {
		dispatch({ type: 'SET_PENDING', pending: true });

		let page = await useFetchPage(arg) || PAGE_404;

		useSetPage({ page });

		dispatch({ type: 'SET_PENDING', pending: false });
	}

	async function useFetchPage(arg: IAPIModulePostsGetArgs): Promise<ITablePostsRow> {
		let response = await axios.request<
			APIModulePosts.Get.StructResponseResult,
			AxiosResponse<APIModulePosts.Get.StructResponseResult>
		>({
			url: useGetHostURL() + '/api/v1/',
			method: 'get',
			headers: {
				'Content-type': 'application/json',
			},
			params: {
				method: 'posts.get',
				argument: arg,
			},
			paramsSerializer(params) {
				return qs.stringify(params, { arrayFormat: 'brackets' })
			},
		});

		let res = response.data;

		if (res.err)
			throw new Error(res.err);

		return res.data[0];
	}

	function useSSRAwait(name: string): void {
		dispatch({ type: 'SET_SSR_AWAIT', name, pending: true });
	}

	function useSSRResolve(name: string): void {
		dispatch((dispatch, getState) => {
			dispatch({ namespace: COMPONENT_NAME, type: 'SET_SSR_AWAIT', name, pending: false });

			let { ssrAwait, onSSRReady } = getState()[COMPONENT_NAME];

			if (!Object.keys(ssrAwait).length && onSSRReady)
				setTimeout(() => onSSRReady(), 10);
		});
	}

	function useGetHostURL(): string {
		if (props.getHostURL)
			return props.getHostURL();

		return '';
	}

	function _useLocation(): IGetLocationResult {
		return _isBrowserEnv
			? useLocation()
			: state.getLocation();
	}

	let value = {
		state,
		dispatch,
		useHistory      : useHistory,
		useLocation     : _useLocation,
		useParams       : useParams,
		useRouteMatch   : useRouteMatch,
		useSetPage,
		useGoToPage,
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
		useLocation,
		useGoToPage,
		useSSRAwait,
		useSSRResolve,
	} = useContext(Context);

	let {
		page,
		pending,
	} = state;

	let isPageReady = !pending && !!page && !!page.uri;

	// let routerParams = useParams();
	let routerLocation = useLocation();

	let _useEffect = () => {
		(async () => {
			useSSRAwait('page-request');

			if (!isPageReady || routerLocation.pathname != page.uri) {
				await useGoToPage({
					filter: {
						uri: routerLocation.pathname,
					},
				});
			}

			useSSRResolve('page-request');
		})();
	};

	_isBrowserEnv
		? useEffect(_useEffect, [routerLocation.pathname])
		: _useEffect();

	return props.children;
}