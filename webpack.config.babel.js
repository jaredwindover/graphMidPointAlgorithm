import webpack from 'webpack';

export default {
	context: __dirname,
	entry: [__dirname + '/js/main.js'],
	module: {
		rules: [
			{
				test: /\.js?$/,
				exclude: /(node_modules)/,
				loader: 'babel-loader',
				query: {
					presets: ['es2015', 'stage-0']
				}
			}
		]
	},
	plugins: [new webpack.NamedModulesPlugin()],
	devtool: '#source-map',
	output: {
		path: __dirname,
		publicPath: '/',
		filename: 'main.min.js'
	}
};
