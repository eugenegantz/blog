'use strict';

export interface IErrorDeclaration {
	code: string;
	name?: string;
	message: string;
}


export class ErrorsRegistry {

	private _errorsByCode = {
		/*
		[code]: {
			code: {String} - должен быть уникальным,
			message: {String} - описание ошибки,
			name: {String} - название,
		}
		* */
	};


	/**
	 * Вернуть декларацию ошибки
	 * */
	add(errDecl: IErrorDeclaration): this {
		errDecl = Object.assign({}, errDecl);

		if (this._errorsByCode[errDecl.code])
			throw new Error('ErrorsRegistry(): Ошибка с указанным кодом уже объявлена');

		this._errorsByCode[errDecl.code] = errDecl;

		return this;
	}


	/**
	 * Удалить декларацию ошибки
	 * */
	remove(arg: { code: string }): this {
		delete this._errorsByCode[arg.code];

		return this;
	}


	/**
	 * Вернуть декларацию ошибки
	 * */
	get(arg: { code: string }): IErrorDeclaration {
		if (!arg.code)
			throw new Error('ErrorsRegistry.get(): !arg.code');

		return this._errorsByCode[arg.code];
	}


	/**
	 * Создать экземпляр ошибки
	 * */
	createError(arg: { message?: string, code: string }): Error {
		let _errDecl    = this.get(arg);
		let message     = arg.message || _errDecl.message;

		return Object.assign(new Error(message), _errDecl, arg);
	}

}