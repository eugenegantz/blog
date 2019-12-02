'use strict';

const
	LRU_CACHE_MAX_SIZE  = 500,
	LRU_CACHE_MAX_AGE   = 1000 * 60 * 5;

import EventEmitter from 'events'
import _ from 'lodash';
import LRUCache from 'lru-cache';
import { ICtorArgs } from './interfaces/common';


export class APIModuleStd extends EventEmitter {

	protected lruCache: any;


	constructor(arg: ICtorArgs = {}) {
		super();

		this.lruCache = new LRUCache({
			max: _.get(arg, 'cache.lru.max', LRU_CACHE_MAX_SIZE),
			maxAge: _.get(arg, 'cache.lru.maxAge', LRU_CACHE_MAX_AGE),
		});
	}


	createCacheKeyFromArg(arg: string | { cache?: true }): string {
		if (typeof arg == 'string')
			return arg;

		arg = _.cloneDeep(arg);

		delete arg.cache;

		return JSON.stringify(arg);
	}

}