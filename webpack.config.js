/*
 * Gulp-Webpack
 * Version: 1.0.0
 * Author: HenriettaSu
 *
 * 自動化構建工具
 * 包含單頁面應用和多頁面應用策略
 *
 * https://github.com/HenriettaSu/Gulp-Webpack
 *
 * License: MIT
 *
 * Released on: April 20, 2017
 */

const webpack = require('webpack'),
	path = require('path'),
	glob = require('glob'),
	ExtractTextPlugin = require('extract-text-webpack-plugin'),
	CommonsChunkPlugin = webpack.optimize.CommonsChunkPlugin,
	UglifyJsPlugin = webpack.optimize.UglifyJsPlugin,
	DedupePlugin = webpack.optimize.DedupePlugin;

// 環境變量，export NODE_ENV=production更改當前終端下環境變量，默認為開發環境
const NODE_ENV = (process.env.NODE_ENV === 'production') ? 'production' : 'develop',
	build = path.resolve(process.cwd(), 'build'),
	vendor = path.resolve(process.cwd(), 'vendor');

let webpackConfig = { // 基礎配置
		cache: true,
		devtool: (NODE_ENV !== 'production') ? 'cheap-module-source-map' : false,
		entry: {}, // 入口
		output: {
			path: path.join(__dirname, 'dist/module'), // 輸出文件目錄
			publicPath: 'dist/module/', // 文件裡的src路徑
			filename: '[name].js',
			chunkFilename: '[name].js' // 單頁面應用。用require.ensure()才會生成chunkFile
		},
		resolve: {
			// 模塊別名定義。模塊引入 require('moment')，可以提高打包速度
			alias: {
				moment: vendor + '/datepicker/moment.js',
				jquery: vendor + '/jquery/jquery-1.12.4.js',
				// 按需加載require.ensure()的文件要定名字否則real難定位
				ensure: build + '/js/ensure.js'
			}
		},
		/*
		 * 聲明外部依賴，用cdn什麼的
		 * 需要通過<script>引入文件，require('jquery')不會將jquery打包到構建文件裡
		 * 如果有插件用到了jquery，直接外部引用，頁面上也可以繼續使用jquery
		 */
		externals: {
			// 'jquery': 'window.jQuery',
			// '$': 'window.jQuery'
		},
		module: {
			rules: [ // 文件加載器
				{
					test: /\.css$/,
					loader: ExtractTextPlugin.extract(
						{
							fallback: 'style-loader?sourceMap',
							use: 'css-loader?sourceMap'
						}
					)
				},
				// 解釋字體
				{
					test: /\.(svg|ttf|woff|woff2|eot)$/i,
					loader: 'file-loader',
					query: {
						name: '[name].[ext]',
						outputPath: '../fonts/',
						publicPath: ' '
					}
				},
				{
				    test: /\.(gif|png|jpe?g)$/i,
				    loaders: [
						{
							loader: 'file-loader',
							query: {
								name: '[name].[ext]',
								outputPath: '../images/',
								publicPath: ' '
				        	}
						},
				        {
				        	loader: 'image-webpack-loader',
				        	query: {
				          		optimizationLevel: 7,
				          		interlaced: false
				        	}
				      	}
				    ]
				},
				// 將對象暴露為全局變量，但是引用的文件會被打包到構建文件裡
				// 唔，這個require.resolve（）是node.js調用的，不能用前面alias設置的別名
				{
					test: require.resolve(vendor + '/jquery/jquery-1.12.4.js'),
					use: [
						{
			                loader: 'expose-loader',
			                options: 'jQuery'
			            },
						{
			                loader: 'expose-loader',
			                options: '$'
		            	}
					]
				}
				/*
				 * 模塊沒有module.exports的，相當於在params.js裡將對象params給module.exports = params
				 * 但是這裡還沒有將params變成全局變量，除了另外使用expose-loader，還可以直接exports?window.params
				 */
				// {
				// 	test: path.resolve(build + '/js/params.js'),
				// 	loader: 'exports?params'
				// }
			],
			noParse: /node_modules\/(jquery|moment|chart\.js)/ // 使某些沒有依賴的文件脫離webpack解釋
		},
    	plugins: [ // 插件越多打包越慢，開發環境下可以適當屏蔽某些
			new webpack.ProvidePlugin({ // 當模塊使用到變量時，自動加載，無須require()
				'$': 'jquery',
				jQuery: 'jquery'
			}),
			new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/), // 忽略moment裡對locale的require()
			new ExtractTextPlugin('[name].css'),
			new UglifyJsPlugin({ // css也在這裡壓縮
				comments: false,
				compress: {
					drop_console: (NODE_ENV === 'production')
				},
				mangle: { // 混淆
					except: ['$', 'exports', 'require', "jQuery"]
				},
				sourceMap: (NODE_ENV !== 'production')
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
						name = split[split.length - 3],
						chunks = split[split.length - 2];
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
	entries = createEntriesCommons('build/modules/**/**/index.js', 'entries'),
	commons = createEntriesCommons('build/modules/**/**/index.js', 'commons');

Object.entries(entries).forEach(arry => { // 生成入口
	let entryKey = arry[0],
		entryVal = arry[1];
    // webpackConfig.entry[name] = entries[name];
    webpackConfig.entry[entryKey] = entryVal;
});

Object.entries(commons).forEach(arry => { // 公共文件提取
	let plugin = new CommonsChunkPlugin({
		name: arry[0],
		chunks: arry[1]
	});
	webpackConfig.plugins.push(plugin);
});

module.exports = webpackConfig;
