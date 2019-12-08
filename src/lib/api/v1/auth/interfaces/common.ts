'use strict';

export namespace APIAuth {

	export type StructResponseSuccess           = void;
	export type StructResponseError             = Error;
	export type StructResponseResult            = StructResponseSuccess | StructResponseError;

}