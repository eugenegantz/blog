'use strict';

import db from '../lib/mysql/mysql-pool';

export default async () => {
	let query = '';

	query += `
		CREATE TABLE IF NOT EXISTS \`t_posts\` (
			\`id\` INT(11) NOT NULL AUTO_INCREMENT COMMENT 'Уникальный идентификатор',
			\`uid\` CHAR(255) NULL DEFAULT NULL COMMENT 'Уникальный записываемый ключ',
			\`title\` CHAR(255) NULL DEFAULT NULL COMMENT 'Заголовок записи',
			\`uri\` CHAR(255) NULL DEFAULT NULL COMMENT 'Уникальный идентификатор ресурса',
			\`type\` CHAR(50) NOT NULL COMMENT 'Тип записи',
			\`content\` MEDIUMTEXT NULL COMMENT 'Содержимое записей',
			\`date\` DATETIME NULL DEFAULT NULL,
			PRIMARY KEY (\`id\`),
			INDEX \`uri\` (\`uri\`) USING HASH,
			INDEX \`title\` (\`title\`) USING HASH,
			INDEX \`type\` (\`type\`) USING HASH
		)
		COLLATE='utf8_general_ci'
		ENGINE=InnoDB
		AUTO_INCREMENT=1
		;
	`;

	query += `
		CREATE TABLE IF NOT EXISTS \`t_posts_meta\` (
			\`id\` INT(11) NOT NULL AUTO_INCREMENT COMMENT 'Уникальный идентификатор',
			\`pid\` INT(11) NOT NULL COMMENT 'Идентификатор записи к которой относится meta-запись',
			\`class\` VARCHAR(64) NULL DEFAULT NULL COMMENT 'Класс мета-записи',
			\`key\` VARCHAR(128) NOT NULL COMMENT 'Ключ',
			\`value\` VARCHAR(10240) NOT NULL COMMENT 'Значение',
			PRIMARY KEY (\`id\`) USING HASH,
			INDEX \`pid\` (\`pid\`) USING HASH,
			INDEX \`value\` (\`value\`(255)) USING HASH,
			INDEX \`class\` (\`class\`) USING HASH,
			INDEX \`key\` (\`key\`) USING HASH,
			INDEX \`key_value\` (\`key\`, \`value\`(100)) USING HASH,
			CONSTRAINT \`fk_t_posts_meta_pid\` FOREIGN KEY (\`pid\`) REFERENCES \`t_posts\` (\`id\`) ON UPDATE CASCADE ON DELETE CASCADE
		)
		COMMENT='Свойства записей'
		COLLATE='utf8_general_ci'
		ENGINE=InnoDB
		ROW_FORMAT=COMPACT
		AUTO_INCREMENT=1
		;
	`;

	query += `
		CREATE TABLE IF NOT EXISTS \`t_user_permissions\` (
			\`id\` INT(11) NOT NULL AUTO_INCREMENT,
			\`name\` VARCHAR(255) NOT NULL,
			\`user_key\` VARCHAR(50) NOT NULL,
			\`user_value\` VARCHAR(50) NOT NULL,
			PRIMARY KEY (\`id\`),
			INDEX \`name\` (\`name\`),
			INDEX \`user_key\` (\`user_key\`),
			INDEX \`user_value\` (\`user_value\`)
		)
		ENGINE=InnoDB
		;
	`;

	query += `
		CREATE TABLE IF NOT EXISTS \`t_users_meta\` (
			\`id\` INT(11) NOT NULL AUTO_INCREMENT COMMENT 'Уникальный идентификатор',
			\`pid\` INT(11) NOT NULL COMMENT 'Идентификатор записи к которой относится meta-запись',
			\`class\` VARCHAR(64) NULL DEFAULT NULL COMMENT 'Класс мета-записи',
			\`key\` VARCHAR(128) NOT NULL COMMENT 'Ключ',
			\`value\` VARCHAR(10240) NOT NULL COMMENT 'Значение',
			PRIMARY KEY (\`id\`) USING HASH,
			INDEX \`pid\` (\`pid\`) USING HASH,
			INDEX \`value\` (\`value\`(255)) USING HASH,
			INDEX \`class\` (\`class\`) USING HASH,
			INDEX \`key\` (\`key\`) USING HASH,
			INDEX \`key_value\` (\`key\`, \`value\`(100)) USING HASH,
			CONSTRAINT \`fk_t_users_meta_pid\` FOREIGN KEY (\`pid\`) REFERENCES \`t_users\` (\`id\`) ON UPDATE CASCADE ON DELETE CASCADE
		)
		COMMENT='Свойства записей'
		COLLATE='utf8_general_ci'
		ENGINE=InnoDB
		ROW_FORMAT=COMPACT
		AUTO_INCREMENT=3
		;
	`;

	return db.query(query);
};