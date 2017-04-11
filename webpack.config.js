/*
 * Gulp-Webpack
 * Version: 0.1.0
 *
 * 自動化構建工具
 * 現在就連測試都沒有試過咯，安裝都沒有安裝過咯
 * 誰叫我現在連上傳到github上都要開自己熱點，好肉赤咯
 *
 * https://github.com/HenriettaSu/Gulp-Webpack
 *
 * License: MIT
 *
 * Released on: April 11, 2017
 */

import webpack from 'webpack';
import path from 'path';
import glob from 'glob';
import ExtractTextPlugin from 'extract-text-webpack-plugin';

let CommonsChunkPlugin = webpack.optimize.CommonsChunkPlugin,
	uglifyJsPlugin = webpack.optimize.UglifyJsPlugin;

// 環境變量，exprot NODE_ENV = build更改當前終端下環境變量，默認為開發環境
const NODE_ENV = (process.env.NODE_ENV === 'production') ? 'production' : 'build',
	build = path.resolve(process.cwd(), 'build'),
	vendor = path.resolve(process.cwd(), 'vendor');

let webpackConfig = {
		cache: true,
		devtool: (NODE_ENV === 'production') ? 'cheap-module-source-map' : 'cheap-module-eval-source-map',
		resolve: {
			// 模塊引入 require('moment');
			alias: {
				moment: vendor + "/datepicker/moment.js"
			}
		},
		module:{
			loaders: [
				{
					test: /\.css$/,
					loader: ExtractTextPlugin.extract('style-loader?sourceMap', 'css-loader?sourceMap')
				},
				{
					test: path.resolve(vendor + '/jquery/jquery.min.js'),
					loader: 'expose?$!expose?jQuery'
				},
				// 不符合模塊的js
				// {
				// 	test: path.resolve(build + '/js/params.js'),
				// 	loader: 'expose?params'
				// },
				// {
				// 	test: require.resolve(build + '/js/params.js'),
				// 	loader: 'exports?params'
				// },
				{
					test: /\.(jpe?g|png|gif)$/i,
					loaders: [
						'file?name=../../dist/images/[name].[ext]',
						'image-webpack?bypassOnDebug&optimizationLevel=7&interlaced=false'
					]
				},
				{
					test: /\.(svg|ttf|woff|woff2|eot)$/i,
					loaders: [
						'file?name=../../dist/fonts/[name].[ext]'
					]
				}
			]
		},
		entry: {}, // 入口
		output: {
			path: path.join(__dirname, 'dist/module'),
			publicPath: 'dist/module',
			filename: '[name].js',
			chunkFilename: '[name].[chunkhash:8].js'
		},
    	plugins: [
			new webpack.ProvidePlugin({ // 全局變量，模塊中無須引入
				'$': 'jquery',
				jQuery: 'jquery',
			}),
			new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/), // 忽略引入模塊中不需要的內容，保留require()
			new ExtractTextPlugin("../css/[name].css"),
			new uglifyJsPlugin({
				compress: {
					warnings: false
				},
				mangle: { // 混淆
					except: ['$', 'exports', 'require', "jQuery"]
				}
			})
		]
	},
	createEntriesCommons = (globPath, type) => {
	    let files = glob.sync(globPath),
			entries = {},
			commons = {};
		switch (type) {
			case 'entries':
				files.forEach(filepath => {
					let split = filepath.split('/'),
						name = split[split.length - 2];
					 entries[name] = './' + filepath;
				 });
			     return entries;
			case 'commons':
			    files.forEach(filepath => {
			        let split = filepath.split('/'),
						name = split[split.length - 2],
						chunks = split[split.length - 3];
					if (!commons[name]) {
				  		commons[name] = new Array;
					}
					commons[name].push(chunks);
			     });
			     return commons;
			default:
				console.error('Cannot find the path or the type is undefined.');
		}
	},
	entries = createEntriesCommons('build/modules/**/**/index.js', 'entires'),
	commons = createEntriesCommons('build/modules/**/**/index.js', 'commons');

Object.entries(entries).forEach(arry => { // 生成入口
	let entryKey = arry[0],
		entryVal = arry[1];
    // webpackConfig.entry[name] = entries[name];
    webpackConfig.entry[entryKey] = entryVal;
});

Object.entries(commons).forEach(arry => { // js提取
	let plugin = new CommonsChunkPlugin({
		name: arry[0],
		chunks: arry[1]
	}
	webpackConfig.plugins.push(plugin);
});

export {webpackConfig};
