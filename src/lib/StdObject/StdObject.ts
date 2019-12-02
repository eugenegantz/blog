'use strict';

export class StdObject {

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

		return this;
	}

}