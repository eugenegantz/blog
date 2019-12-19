'use strict';

import React, { useReducer, useContext, useEffect } from 'react';
import _utilsReq from '../../../lib/utils/req';
import {
	Provider            as _Provider,
	// useStore            as _useStore,
	// useSelector         as _useSelector,
	// useDispatch         as _useDispatch,
	createStoreHook     as _createStoreHook,
	createDispatchHook  as _createDispatch,
	createSelectorHook  as _createSelectorHook,
} from 'react-redux';


const _contextCache         = {};
const _useStoreCache        = {};
const _useDispatchCache     = {};
const _useSelectorCache     = {};


export function getContext() {
	let id = _utilsReq.getRuntimeContextId();

	return _contextCache[id] || (_contextCache[id] = React.createContext(null));
}


export function clearRuntimeContext() {
	let id = _utilsReq.getRuntimeContextId();

	delete _contextCache[id];
	delete _useStoreCache[id];
	delete _useDispatchCache[id];
	delete _useSelectorCache[id];
}


export function Provider(props) {
	let context = getContext();

	return <_Provider {...props} context={context} />
}


export function useStore() {
	let id = _utilsReq.getRuntimeContextId();

	let useStore = _useStoreCache[id] || (_useStoreCache[id] = _createStoreHook(getContext()));

	return useStore();
}


export function useSelector(func) {
	let id = _utilsReq.getRuntimeContextId();

	let useSelector = _useSelectorCache[id] || (_useSelectorCache[id] = _createSelectorHook(getContext()));

	return useSelector(func);
}


export function useDispatch() {
	let id = _utilsReq.getRuntimeContextId();

	let useDispatch = _useDispatchCache[id] || (_useDispatchCache[id] = _createDispatch(getContext()));

	return useDispatch();
}