'use strict';

import errorRegistry from '../../../errors/errors';

errorRegistry.add({
	code: '38844566467951513',
	message: 'Пользователь не найден',
});

errorRegistry.add({
	code: '4669908729208754',
	message: 'Неверно указан пароль',
});

errorRegistry.add({
	code: '9216347928410324',
	message: 'Не авторизован',
});

export default errorRegistry;