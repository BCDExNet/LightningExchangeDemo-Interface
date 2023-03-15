const webpack = require('webpack');

module.exports = function override(config, env) {
	config.resolve.extensions = ['.ts', '.js'];

	config.resolve.fallback = {
		"stream": require.resolve("stream-browserify"),
		"assert": require.resolve("assert/"),
		// "fs": false,
		// "tls": false,
		// "net": false,
		// "http": require.resolve("stream-http"),
		// "https": false,
		// "zlib": require.resolve("browserify-zlib") ,
		"path": require.resolve("path-browserify"),
		// "util": require.resolve("util/"),
		"crypto": require.resolve("crypto-browserify"),
		"buffer": require.resolve("buffer/")
	};

	config.plugins = (config.plugins || []).concat([
		new webpack.ProvidePlugin({
			Buffer: ['buffer', 'Buffer'],
		}),
		new webpack.ProvidePlugin({
			process: 'process/browser',
		}),
	]);

	return config;
}