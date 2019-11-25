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

	target: 'web',

	entry: MODULES.path.resolve(__dirname, './src/ui/index.tsx'),

	output: {
		filename: '[name].[hash].bundle.js',
		chunkFilename: '[id].js',
		path: MODULES.path.resolve(__dirname, './static/bundles/'),
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
					{
						loader: MODULES.path.resolve(__dirname, './loaders/import-meta.js'),
					},
					{
						loader: "ts-loader",
						options: {
							compilerOptions: {
								jsx: 'react',
							}
						}
					}
				]
			},
			// All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
			{
				enforce: "pre",
				test: /\.js$/,
				loader: "source-map-loader"
			},

			{
				test: /\.m\.css$/i,
				use: [
					{
						loader: MiniCssExtractPlugin.loader,
						options: {
							hmr: process.env.NODE_ENV === 'development',
						},
					},
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
		]
	},

	plugins: [
		/*
		new webpack.WatchIgnorePlugin([
			/\.js$/,
			/\.d\.ts$/
		]),
		*/
		new MiniCssExtractPlugin({
			// Options similar to the same options in webpackOptions.output
			// all options are optional
			filename: '[name].[hash].css',
			chunkFilename: '[id].css',
			ignoreOrder: false, // Enable to remove warnings about conflicting order
		}),
	],

	// When importing a module whose path matches one of the following, just
	// assume a corresponding global variable exists and use that instead.
	// This is important because it allows us to avoid bundling all of our
	// dependencies, which allows browsers to cache those libraries between builds.
	externals: [
		// nodeExternals(),
	]
};