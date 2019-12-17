declare namespace NodeJS {
	interface Global {
		__root: string;
	}
}

declare const __root: string;

declare interface Window {
	__REDUX_PRELOADED_STATE__: object;
}