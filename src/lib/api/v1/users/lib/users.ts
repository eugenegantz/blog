'use strict';

import db from '../../../../mysql/mysql-pool';
import { APIModuleUsers } from './APIModuleUsers';

const
	apiUsers = new APIModuleUsers();

apiUsers.setDatabaseInstance(db);

export default apiUsers;