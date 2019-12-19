'use strict';

import React from 'react';
import reactDOM from 'react-dom';
import CTXRouter, { reducer } from './components/ctx-router/ctx-router';
// import { Provider } from 'react-redux';
import { Provider } from './components/ctx-redux/ctx-redux';
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';

document.addEventListener('DOMContentLoaded', () => {
	let store = createStore(reducer, applyMiddleware(thunk));
	let initialState = window.__REDUX_PRELOADED_STATE__;

	store.dispatch({ type: 'init', initialState });

	let app = (
		<Provider store={store} >
			<CTXRouter />
		</Provider>
	);

	reactDOM.render(app, document.querySelector('#app'));
}, false);