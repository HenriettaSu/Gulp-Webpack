/*
 * Gulp-Webpack
 * Version: 0.2.1
 *
 * 自動化構建工具
 * 剛剛開始聯網安裝，測試中
 *
 * https://github.com/HenriettaSu/Gulp-Webpack
 *
 * License: MIT
 *
 * Released on: April 18, 2017
 */

'use strict';
const gulp = require('gulp'),
    gulpif = require('gulp-if'),
    changed = require('gulp-changed'),
    rename = require('gulp-rename'),
    sass = require('gulp-sass'),
    autoPrefixer = require('gulp-autoprefixer'), // css3前綴
    spritesmith = require('gulp.spritesmith'), // css sprite
    cleanCSS = require('gulp-clean-css'), // css壓縮
    pump = require('pump'), // 錯誤定位
    uglify = require('gulp-uglify'), // js壓縮
    eslint = require('gulp-eslint'), // js審查
    imagemin = require('gulp-imagemin'), // img壓縮
    pngquant = require('imagemin-pngquant'), // png壓縮
    sourceMaps = require('gulp-sourcemaps'), // sourcemaps
    concat = require('gulp-concat'), // 文件合併
    assetRev = require('gulp-asset-rev'),
    bs = require('browser-sync').create(),
    stripDebug = require('pump'), // 清除console, alert, debugger
    postcss = require('gulp-postcss'),
    syntax_scss = require('postcss-scss'), // postcss識別sass
    stylelint = require('stylelint'), //css審查
    reporter = require('postcss-reporter'),
    webpack = require('webpack'),
    webpackConfig = require('./webpack.config'),
    gutil = require('gulp-util'),

    devCompiler = webpack(webpackConfig),

    // 環境變量，export NODE_ENV=production更改當前終端下環境變量，默認為開發環境
    NODE_ENV = (process.env.NODE_ENV === 'production') ? 'production' : 'develop',

    // file path
    buildImg = 'build/images/*',
    BUILD_IMG_PATH = 'build/images/',
    buildSass = 'build/sass/*.scss',
    BUILD_SASS_PATH = 'build/sass/',
    buildIcon = 'build/icon/*',
    BUILD_ICON_PATH = 'build/icon/*.png',
    buildCss = 'build/css/*.css',
    BUILD_CSS_PATH = 'build/css',
    buildJs = 'build/js/*.js',
    buildModule = 'build/module/*/*/*.js',
    DIST_IMG_PATH = 'dist/images',
    DIST_CSS_PATH = 'dist/css',
    DIST_JS_PATH = 'dist/js',
    moduleCss = 'dist/module/*.css',
    MODULE_PATH = 'dist/module/',
    html = '*.html';

// create css sprite
gulp.task('css-sprite', () => gulp
    .src(buildIcon)
    .pipe(spritesmith({
        imgName: 'sprite.png',
        cssName: 'icon.css',
        imgPath:'../images/sprite.png',
        algorithm: 'left-right'
    }))
    .pipe(gulpif('*.png', gulp.dest(BUILD_IMG_PATH), gulp.dest(BUILD_CSS_PATH)))
);

// minify image
gulp.task('imagemin', ['css-sprite'], () => gulp
    .src(buildImg)
    .pipe(changed(buildImg))
    .pipe(imagemin({
        progressive: true,
        interlaced: true,
        use: [pngquant()]
    }))
    .pipe(gulp.dest(DIST_IMG_PATH))
);

gulp.task('stylelint', cb => {
    let processors = [
            stylelint(),
            reporter({
                clearMessages: true
            })
        ];
    pump([
            gulp.src(buildSass),
            postcss(processors, {syntax: syntax_scss})
        ],
        cb
    );
});

// sass to css
gulp.task('sass-to-css', ['stylelint'], () => gulp
    .src(buildSass)
    .pipe(changed(buildSass))
    .pipe(sourceMaps.init())
    .pipe(sass().on('error', e => {
        console.error(e.message);
    }))
    .pipe(autoPrefixer({
        // mobile
        // browsers: ['> 1%', 'last 2 versions'],
        // pc
        browsers: ['> 1%', 'last 2 versions', 'ie 6-11'],
        cascade: false
    }))
    .pipe(sourceMaps.write('../../dist/css/maps'))
    .pipe(gulp.dest(BUILD_CSS_PATH))
);

// minify css
gulp.task('minify-css', () => gulp
    .src(buildCss)
    .pipe(changed(buildCss))
    .pipe(concat('style.css'))
    .pipe(gulp.dest(DIST_CSS_PATH))
    .pipe(cleanCSS({level: {1: {specialComments: 0}}, compatibility: 'ie8'}))
    .pipe(rename({suffix: '.min'}))
    // .pipe(assetRev())
    .pipe(gulp.dest(DIST_CSS_PATH))
);

// minify module css
gulp.task('minify-module-css', () => gulp
    .src(moduleCss)
    .pipe(changed(moduleCss))
    .pipe(cleanCSS({level: {1: {specialComments: 0}}, compatibility: 'ie8'}))
    .pipe(gulp.dest(MODULE_PATH))
);

// js lint
gulp.task('eslint', () => gulp
    .src(buildJs)
    .pipe(changed(buildJs))
    //.pipe(stripDebug())
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError())
);

// minify js
gulp.task('jscompress', ['eslint'], cb => {
    pump([
            gulp.src(buildJs),
            //stripDebug(),
            uglify(),
            rename({suffix: '.min'}),
                // .pipe(assetRev())
            gulp.dest(DIST_JS_PATH)
        ],
        cb
    );
});

// html added rev
gulp.task('rev', () => gulp
    .src(html)
    .pipe(assetRev({hashLen: 8, verConnecter: '?v='}))
    .pipe(gulp.dest(''))
);

// webpack
gulp.task('webpack', ['eslint'], cb => {
    devCompiler.run((err, stats) => {
        if (err) {
            throw new gutil.PluginError('webpack', err)
        };
        gutil.log('[webpack]', stats.toString({
            colors: true
        }));
        cb();
    });
});

// watch icon
gulp.task('watch-icon', done => {
    gulp.watch(buildIcon, ['css-sprite'])
        .on('end', done);
});

// watch img
gulp.task('watch-img', done => {
    gulp.watch(buildImg, ['imagemin'])
        .on('end', done);
});

// watch sass
gulp.task('watch-sass', done => {
    gulp.watch(buildSass, ['sass-to-css'])
        .on('end', done);
});

// watch css
gulp.task('watch-css', done => {
    gulp.watch(buildCss, ['minify-css'])
        .on('end', done);
});

// watch css with webpack
gulp.task('watch-css-wp', done => {
    gulp.watch(buildCss, ['webpack'])
        .on('end', done);
});

// watch js
gulp.task('watch-js', done => {
    gulp.watch(buildJs, ['jscompress'])
        .on('end', done);
});

// watch js with webpack
gulp.task('watch-js-wp', done => {
    gulp.watch(buildJs, ['webpack'])
        .on('end', done);
    gulp.watch(buildModule, ['webpack'])
        .on('end', done);
});

// watch css in module
gulp.task('watch-module-css', done => {
    gulp.watch(moduleCss, ['minify-module-css'])
        .on('end', done);
});

// 開發版
gulp.task('watch', ['watch-icon', 'watch-img', 'watch-sass', 'watch-css', 'watch-js']);

// webpack版
gulp.task('watch-wp', ['watch-icon', 'watch-img', 'watch-sass', 'watch-css-wp', 'watch-module-css',  'watch-js-wp']);

// browser-sync
gulp.task('browser-sync', () => {
    bs.init({
        server: {
            baseDir: './'
        },
        files: ['./dist/**/*.*', './']
        // tunnel: "henriettaSu",
        // online: true
        /*
         * server為靜態服務器
         * 某些場合下需要測試功能時，開啟tunnel和online即可
         * 開啟後會非常卡，建議測試結束後關掉
         */
    });
    // gulp.watch('./dist/**/*.*').on('change', bs.reload);
});

// gulp
gulp.task('default', ['watch', 'browser-sync']);
gulp.task('wp', ['watch-wp', 'browser-sync']); // webpack打包版
