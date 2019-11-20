'use strict';

export default async function(req, res) {
	try {
		let html = `
			<!DOCTYPE html>
			<html>
				<head>
					<meta charset="UTF-8" />
				</head>
				<body>
					<div>
						${new Date}
					</div>
				</body>
			</html>
		`;

		res.send(html);

	} catch (err) {
		err += '';

		res.send({ err });
	}
};