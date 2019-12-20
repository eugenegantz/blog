'use strict';

import React from 'react';
import reactDOM from 'react-dom';
import CTXRouter from './components/ctx-router/ctx-router';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { createReducer } from './reducers/reducers';

document.addEventListener('DOMContentLoaded', () => {
	let rootReducer     = createReducer();
	let store           = createStore(rootReducer, applyMiddleware(thunk));
	let initialState    = window.__REDUX_PRELOADED_STATE__;

	store.reducer = rootReducer;

	store.dispatch({ type: 'INIT', state: initialState });

	let app = (
		<Provider store={store} >
			<CTXRouter />
		</Provider>
	);

	reactDOM.render(app, document.querySelector('#app'));
}, false);