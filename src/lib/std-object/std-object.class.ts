'use strict';

import { StdEventTarget } from "../std-event-target/std-event-target.class";


class StdObject extends StdEventTarget {

	private _fields: object = {};


	private _key(key: string): string {
		return key.toLowerCase();
	}


	get(key: string): any {
		return this._fields[this._key(key)];
	}


	set(key: string, value: any): this {
		key = this._key(key);

		this._fields[key] = value;

		this.emit('set:' + key, { value, key });

		return this;
	}

}