/*
 * Gulp-Webpack
 * Version: 0.1.1
 *
 * 自動化構建工具
 * 現在就連測試都沒有試過咯，安裝都沒有安裝過咯
 * 連上傳到github上都要開自己熱點，好肉赤咯
 *
 * https://github.com/HenriettaSu/Gulp-Webpack
 *
 * License: MIT
 *
 * Released on: April 12, 2017
 */

import webpack from 'webpack';
import path from 'path';
import glob from 'glob';
import ExtractTextPlugin from 'extract-text-webpack-plugin';

let CommonsChunkPlugin = webpack.optimize.CommonsChunkPlugin,
	UglifyJsPlugin = webpack.optimize.UglifyJsPlugin,
	DedupePlugin = webpack.optimize.DedupePlugin;

// 環境變量，exprot NODE_ENV = production更改當前終端下環境變量，默認為開發環境
const NODE_ENV = (process.env.NODE_ENV === 'production') ? 'production' : 'develop',
	build = path.resolve(process.cwd(), 'build'),
	vendor = path.resolve(process.cwd(), 'vendor');

let webpackConfig = { // 基礎配置
		cache: true,
		devtool: (NODE_ENV !== 'production') ? 'cheap-module-eval-source-map' : false,
		entry: {}, // 入口
		output: {
			path: path.join(__dirname, 'dist/module'),
			publicPath: 'dist/module',
			filename: '[name].js',
			chunkFilename: '[name].[chunkhash:8].js'
		},
		resolve: {
			// 模塊別名定義。模塊引入 require('moment');
			alias: {
				moment: vendor + '/datepicker/moment.js',
				jquery: vendor + '/jquery-1.12.4/js/jquery.min.js'
			}
		},
		/*
		 * 指向全局變量
		 * 需要通過<script>引入文件，require('jquery')不會將jquery打包到構建文件裡
		 */
		externals: {
			'jquery': 'window.jQuery',
			'$': 'window.jQuery'
		},
		module:{
			loaders: [ // 文件加載器
				{
					test: /\.css$/,
					loader: ExtractTextPlugin.extract('style-loader?sourceMap', 'css-loader?sourceMap')
				},
				// 將對象暴露為全局變量，但是引用的文件會被打包到構建文件裡
				// {
				// 	test: path.resolve('jquery'),
				// 	loader: 'expose?$!expose?jQuery'
				// },
				// 沒有module.export的
				// {
				// 	test: path.resolve(build + '/js/params.js'),
				// 	loader: 'exports?params'
				// },
				{
					test: /\.(jpe?g|png|gif)$/i,
					loaders: [
						'file?name=../../dist/images/[name].[ext]',
						'image-webpack?bypassOnDebug&optimizationLevel=7&interlaced=false'
					]
				},
				// 解釋字體
				// {
				// 	test: /\.(svg|ttf|woff|woff2|eot)$/i,
				// 	loaders: [
				// 		'file?name=../../dist/fonts/[name].[ext]'
				// 	]
				// }
			],
			noParse: /node_modules\/(jquery|moment|chart\.js)/ // 使某些沒有依賴的文件脫離webpack解釋
		},
    	plugins: [
			new webpack.ProvidePlugin({ // 全局變量。當模塊使用到變量時，自動加載，無須require()
				'$': 'jquery',
				jQuery: 'jquery'
			}),
			new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/), // 忽略需要下載才能打包的模塊
			new ExtractTextPlugin("../css/[name].css"),
			new DedupePlugin(), // 避免重複模塊
			new UglifyJsPlugin({ // css也在這裡壓縮
				beautify: false,
				comments: false,
				compress: {
					warnings: false,
					drop_console: (NODE_ENV === 'production')
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
