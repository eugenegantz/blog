'use strict';

import modPath from 'path';
import modURL from 'url';

const
	// @ts-ignore
	importMetaUrl = import.meta.url;

const
	__filename = modURL.fileURLToPath(importMetaUrl),
	__dirname = modPath.dirname(__filename);

global.__root = modPath.resolve(__dirname, '../../');