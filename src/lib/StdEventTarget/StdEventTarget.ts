'use strict';

interface EventsNameMapping {
	[key: string]: Map<string, Function>
}

type EventsHandlerMapping = Map<Function, Function>;


export class StdEventTarget {

	private _events: EventsNameMapping = {};


	private _getEventsByName(eventName: string): EventsHandlerMapping {
		return this._events[eventName] = this._events[eventName] || new Map();
	}


	public on(eventName: string, handler: Function): this {
		this._getEventsByName(eventName).set(handler, handler);

		return this;
	}


	public off(eventName: string, handler: Function): this {
		this._getEventsByName(eventName).delete(handler);

		return this;
	}


	public emit(eventName: string, ...data: any[]): this {
		this._getEventsByName(eventName).forEach((func: Function) => {
			func.apply(this, [this, ...data]);
		});

		return this;
	}

}