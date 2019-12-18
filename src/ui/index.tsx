'use strict';

import React from 'react';
import reactDOM from 'react-dom';
import CTXRouter, { reducer } from './components/ctx-router/ctx-router';
import { Provider } from 'react-redux';
import { createStore } from 'redux';

document.addEventListener('DOMContentLoaded', () => {
	let store = createStore(reducer);
	let initialState = window.__REDUX_PRELOADED_STATE__;

	store.dispatch({ type: 'init', initialState });

	let app = (
		<Provider store={store} >
			<CTXRouter />
		</Provider>
	);

	reactDOM.render(app, document.querySelector('#app'));
}, false);