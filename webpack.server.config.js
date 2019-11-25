const
	nodeExternals = require('webpack-node-externals'),
	webpack = require('webpack'),
	MiniCssExtractPlugin = require('mini-css-extract-plugin'),
	MODULES = {
		path: require('path'),
	};

module.exports = {
	// mode: "production",
	mode: 'development',

	target: 'node',

	entry: {
		server: MODULES.path.resolve(__dirname, './src/server.ts'),
	},

	output: {
		filename: '[name].bundle.js',
		chunkFilename: '[id].js',
		path: MODULES.path.resolve(__dirname, './dist/'),
	},

	// Enable sourcemaps for debugging webpack's output.
	devtool: "source-map",

	resolve: {
		// Add '.ts' and '.tsx' as resolvable extensions.
		extensions: [".ts", ".tsx", ".js", ".jsx"]
	},

	module: {
		rules: [
			{
				test: /\.ts(x?)$/,
				// exclude: /node_modules/,
				use: [
					MODULES.path.resolve(__dirname, './loaders/import-meta.js'),
					"ts-loader",
				]
			},
			{
				test: /\.m\.css$/i,
				use: [
					{
						loader: 'css-loader',
						options: {
							importLoaders: 1,
							modules: {
								localIdentName: '[name]__[hash:base64:5]',
							},
						},
					},
				],
			},
		],
	},

	plugins: [],

	// When importing a module whose path matches one of the following, just
	// assume a corresponding global variable exists and use that instead.
	// This is important because it allows us to avoid bundling all of our
	// dependencies, which allows browsers to cache those libraries between builds.
	externals: [
		nodeExternals(),
		{
			tedious                 : 'require("tedious")',
			sqlite3                 : 'require("sqlite3")',
			mssql                   : 'require("mssql")',
			'mssql/lib/base'        : 'require("mssql/lib/base")',
			'mssql/package.json'    : 'require("mssql/package.json")',
			mysql2                  : 'require("mysql2")',
			mariasql                : 'require("mariasql")',
			mysql                   : 'require("mysql")',
			oracle                  : 'require("oracle")',
			'strong-oracle'         : 'require("strong-oracle")',
			oracledb                : 'require("oracledb")',
			pg                      : 'require("pg")',
			'pg-query-stream'       : 'require("pg-query-stream")'
		}
	],
};