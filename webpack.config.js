const
	MiniCssExtractPlugin = require('mini-css-extract-plugin');

const
	MODULES = {
		path: require('path'),
	};


module.exports = {
	// mode: "production",
	mode: 'development',

	entry: MODULES.path.resolve(__dirname, './src/controllers/common.ts'),

	output: {
		filename: '[chunkhash].bundle.js',
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
						loader: "ts-loader"
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
				test: /\.css$/i,
				use: [
					{
						loader: MiniCssExtractPlugin.loader,
						options: {
							hmr: process.env.NODE_ENV === 'development',
						},
					},
					'css-loader',
				],
			},
		]
	},

	plugins: [
		new MiniCssExtractPlugin({
			// Options similar to the same options in webpackOptions.output
			// all options are optional
			filename: '[name].css',
			chunkFilename: '[id].css',
			ignoreOrder: false, // Enable to remove warnings about conflicting order
		}),
	],

	// When importing a module whose path matches one of the following, just
	// assume a corresponding global variable exists and use that instead.
	// This is important because it allows us to avoid bundling all of our
	// dependencies, which allows browsers to cache those libraries between builds.
	/*
	externals: {
		"react": "React",
		"react-dom": "ReactDOM"
	}
	*/
};