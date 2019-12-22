'use strict';

const regex = /import\.meta/g;
const modURL = require('url');

module.exports = function(source) {
	return source.replace(regex, () => {
		let fileURL = modURL.pathToFileURL(this.resourcePath);

		return `({ url: "${fileURL}" })`;
	});
};