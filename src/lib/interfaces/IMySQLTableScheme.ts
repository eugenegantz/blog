'use strict';


interface IMySQLTableScheme extends Object {

	field: string,


	type: string,


	'null': string,


	key: string,


	'default': string,


	extra: string,

}


export { IMySQLTableScheme };