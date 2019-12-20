'use strict';

import { produce } from 'immer';
import _merge from 'lodash/merge';

const
	_ = {
		merge: _merge,
	};

const
	initialState = {
		page: {},
		pending: false,
		id: 0,
		ssrAwait: {},
		onSSRReady: () => {},
	};

const
	_reduce = {
		INIT(prevState, { state }) {
			return produce(prevState, draftState => {
				return _.merge(draftState, state || {});
			});
		},
		SET_PENDING(state, { pending }) {
			return produce(state, state => {
				state.pending = pending;
			});
		},
		SET_PAGE(state, { page }) {
			return produce(state, state => {
				state.page = page;
			});
		},
		SET_SSR_AWAIT(_state, { name, pending }) {
			return produce(_state, state => {
				pending
					? state.ssrAwait[name] = true
					: delete state.ssrAwait[name];
			});
		},
		ON_SSR_READY(state, { callback }) {
			let _callback = (() => {
				let _done = 0;

				return (...a) => !_done++ && callback(...a);
			})();

			return produce(state, state => {
				state.onSSRReady = _callback;
			});
		},
		MERGE(prevState, { state }) {
			return produce(prevState, draftState => {
				_.merge(draftState, state);
			});
		}
	};

export function reducer(state, action) {
	state = state || initialState;

	if (!_reduce[action.type])
		return;

	return _reduce[action.type](state, action);
}