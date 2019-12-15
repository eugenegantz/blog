const pluginName = 'on-build';

class ConsoleLogOnBuildWebpackPlugin {

	constructor(func) {
		this._func = func;
	}


	apply(compiler) {
		compiler.hooks.done.tap(pluginName, stats => {
			this._func(stats);
		});
	}

}

module.exports = ConsoleLogOnBuildWebpackPlugin;