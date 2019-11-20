'use strict';

import { ITableMetaRows } from '../../../../../interfaces/tables/ITableMetaRows';


export type QueryBuilder                        = any;
export type IArgQueryBuilderFilterValueBase     = string | number | object;
export type IArgQueryBuilderFilterValue         = Array<IArgQueryBuilderFilterValueBase> | IArgQueryBuilderFilterValueBase
export type IAPIModuleStdResultStructSuccess    = { data: any };
export type IAPIModuleStdResultStructError      = Error;
export type IAPIModuleResultStruct              = IAPIModuleStdResultStructSuccess | IAPIModuleStdResultStructError;


export interface IArgQueryBuilderFilter {

	meta?: {
		[key: string]: IArgQueryBuilderFilterValue
	}

	[key: string]: IArgQueryBuilderFilterValue

}


export interface IArgQueryBuilderParams {

	page?: number


	perPage?: number


	orderBy?: {

		[key: string]: string,

	},

}


export interface IArgQueryBuilder {

	filter?: IArgQueryBuilderFilter


	params?: IArgQueryBuilderParams

}


export interface IArgQueryBuilderOptScheme {

	main?: string


	meta?: string

}


export interface IArgQueryBuilderOptTables {

	main?: string

	meta?: string

}


export interface IArgQueryBuilderOpt {

	scheme?: IArgQueryBuilderOptScheme


	tables?: IArgQueryBuilderOptTables

}


export interface IFieldOperator {

	regex: RegExp


	operator: string


	handler?: Function

}


export interface IArgBuildStdMetaTableUpsertQueryByDiff extends IArgQueryBuilderOpt, IArgQueryBuilder {

	meta?: {

		next: ITableMetaRows


		prev: ITableMetaRows

	}

}


export interface IResBuildStdMetaTableUpsertQueryByDiff {

	insert: QueryBuilder


	update: QueryBuilder[]


	'delete': QueryBuilder


	toString: () => string

}


export interface ICtorArgs {

	cache?: {

		lru?: {

			max?: number,

			maxAge?: number,

		},

	},

}