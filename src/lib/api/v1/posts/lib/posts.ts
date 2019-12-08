'use strict';

import db from '../../../../mysql/mysql-pool';
import { APIModulePosts } from './APIModulePosts';

const
	posts = new APIModulePosts();

posts.setDatabaseInstance(db);

export default posts;