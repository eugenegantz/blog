'use strict';

import { produce } from 'immer'
import _merge from 'lodash/merge';
import _set from 'lodash/set';
import _get from 'lodash/get';
import _has from 'lodash/has';
import _toPath from 'lodash/toPath';
import { AnyAction, Reducer } from 'redux';

const
	_ = {
		merge: _merge,
		set: _set,
		get: _get,
		has: _has,
		toPath: _toPath,
	};


interface IAction extends AnyAction {
	namespace?: string;
}


type TReducer = Reducer<object, IAction>;


interface IRootReducer {

	(state: object, action: IAction): object;


	add(namespace: string, reducer: TReducer);


	has(namespace: string, reducer: TReducer): boolean;

}


declare module 'redux' {

	interface Store {

		reducer: IRootReducer;

	}

}


export function createReducer(): IRootReducer {
	let reducers = {};

	function rootReducer(prevState: object, action: IAction): object {
		prevState = prevState || {};

		let nameSpaceNextState;
		let namespace = action.namespace || 'default';
		let _reducer = _.get(reducers, namespace);

		if (!_reducer)
			return prevState;

		if ('default' === namespace) {
			if (nameSpaceNextState = _reducer(prevState, action))
				return nameSpaceNextState;

		} else {
			if (nameSpaceNextState = _reducer(prevState[namespace], action)) {
				return produce(prevState, draftState => {
					draftState[namespace] = nameSpaceNextState;
				});
			}
		}

		return prevState;
	}

	rootReducer.add = function(namespace: string = 'default', reducer: TReducer): void {
		_.set(reducers, namespace, reducer);
	};

	rootReducer.has = function(namespace: string = 'default', reducer: TReducer): boolean {
		return _.get(reducers, namespace) == reducer;
	};

	rootReducer.add(void 0, (prevState: object, action: IAction): object => {
			let { type, state } = action;

			if ('INIT' === type) {
				return produce(prevState, draftState => {
					_.merge(draftState, state || {});
				});
			}
		}
	);

	return rootReducer;
}