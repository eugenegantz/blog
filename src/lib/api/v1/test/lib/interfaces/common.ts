'use strict';

type IAPIModuleTestResultStructSuccess          = { data: number };
type IAPIModuleTestResultStructError            = Error;
type IAPIModuleTestResultStruct                 = IAPIModuleTestResultStructSuccess | IAPIModuleTestResultStructError;


export {
	IAPIModuleTestResultStruct,
	IAPIModuleTestResultStructError,
	IAPIModuleTestResultStructSuccess,
}