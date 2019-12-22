'use strict';

import React, {useState, useEffect} from 'react';
import BLayoutMain from '../b-layout-main/b-layout-main';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function PMain() {
	let [posts = [], setPosts] = useState();

	useEffect(() => {
		(async () => {
			let config = {
				url: '/api/v1/',
				params: {
					method: 'posts.get',
					argument: {},
				},
			};

			let response = await axios.request(config);
			let res = response.data;

			setPosts(res.data);
		})();
	}, []);

	return (
		<BLayoutMain>
			{
				posts.reduce((arr, post) => {
					if (post.uri == '/')
						return arr;

					arr.push(
						<div key={post.id}>
							<Link to={post.uri}>
								{
									post.title
								}
							</Link>
						</div>
					);

					return arr;
				}, [])
			}
		</BLayoutMain>
	)
}