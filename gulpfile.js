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

'use strict';
import gulp from 'gulp';
import gulpif from 'gulp-if';
import changed from 'gulp-changed';
import rename from 'rename';
import sass from 'gulp-sass';
import autoPrefixer from 'gulp-autoprefixer'; // css3前綴
import spritesmith from 'gulp.spritesmith'; // css sprite
import cleanCSS from 'gulp-clean-css'; // css壓縮
import mocha from 'gulp-mocha'; // js單元測試
import pump from 'pump'; // 錯誤定位
import uglify from 'gulp-uglify'; // js壓縮
import eslint from 'gulp-eslint'; // js審查
import imagemin from 'gulp-imagemin'; // img壓縮
import pngquant from 'imagemin-pngquant'; // png壓縮
import sourceMaps from 'gulp-sourcemaps'; // sourcemaps
import concat from 'gulp-concat'; // 文件合併
import browserSync from 'browser-sync';
// import {create as bs} from 'browser-sync';
import stripDebug from 'gulp-strip-debug'; // 清除console, alert, debugger
import postcss from 'gulp-postcss';
import syntax_scss from 'postcss-scss'; // postcss識別sass
import stylelint from 'stylelint'; //css審查
import reporter from 'postcss-reporter';
import webpack from 'webpack';
import webpackConfig from './webpack.config';
import gutil from 'gulp-util';

// 環境變量，exprot NODE_ENV = build更改當前終端下環境變量，默認為開發環境
const NODE_ENV = (process.env.NODE_ENV === 'production') ? 'production' : 'build',
    bs = browserSync.create(),
    devCompiler = webpack(webpackConfig),
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
    DIST_JS_PATH = 'dist/js';

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

// sass lint
// gulp.task('stylelint', function () {
//     let processors = [
//             stylelint(),
//             reporter({
//                 clearMessages: true
//             })
//         ];
//     return gulp.src(buildSass)
//         .pipe(postcss(processors, {syntax: syntax_scss}));
// });
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
    .src([/* 'other file's path', */ buildCss])
    .pipe(changed(buildCss))
    // .pipe(assetRev())
    .pipe(concat('style.css'))
    .pipe(gulp.dest(DIST_CSS_PATH))
    .pipe(cleanCSS({compatibility: 'ie8'}))
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest(DIST_CSS_PATH))
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
            gulp.dest(DIST_JS_PATH)
        ],
        cb
    );
});

// webpack
gulp.task('webpack', cb => {
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

// watch js
gulp.task('watch-js', done => {
    // gulp.watch(buildJs, ['jscompress'])
    gulp.watch(buildJs, ['webpack'])
        .on('end', done);
    gulp.watch(buildModule, ['webpack'])
        .on('end', done);
});

// 開發版
gulp.task('watch', ['watch-icon', 'watch-img', 'watch-sass', 'watch-css', 'watch-js']);

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
